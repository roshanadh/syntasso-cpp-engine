const {
	compileInCppContainer,
	linkInCppContainer,
	execInCppContainer,
} = require("../docker/index.js");

const handleCompilationError = require("./handleCompilationError.js");
const handleLinkerError = require("./handleLinkerError.js");
const handle403Response = require("./handle403Response.js");

const { compilationWarningParser, logger } = require("../util/index.js");

module.exports = (req, res, next) => {
	const { socketInstance } = require("../server.js");
	let times = {};
	let compilationWarnings = null;
	compileInCppContainer(req, socketInstance)
		/*
		 * resolves possible compilation warnings and stdout of compilation process as...
		 * ... {compilationWarnings, stdout}, and rejects any possible compilation error...
		 * ... as {compilationError}
		 */
		.then(compilationLogs => {
			/*
			 * compilationLogs.stdout contains the output of compilation
			 * compilationLogs.compilationWarnings contains any possible compilation warnings
			 * compilationLogs.compilationTime contains the time taken to compile submission
			 */
			if (compilationLogs.compilationWarnings) {
				// get the warning stack and an array of parsed individual warnings
				let {
					warningStack,
					warnings,
					errorInParser,
				} = compilationWarningParser(
					compilationLogs.compilationWarnings,
					req.body.socketId
				);
				if (errorInParser) return next(errorInParser);
				compilationWarnings = {
					warningStack,
					warnings,
				};
			}
			times.compilationTime = compilationLogs.compilationTime;
			return linkInCppContainer(req, socketInstance);
		})
		.then(linkLogs => {
			/*
			 * linkInCppContainer.stdout contains the output of linking
			 * linkInCppContainer rejects any error as {error}
			 */
			times.linkTime = linkLogs.linkTime;
			return execInCppContainer(req, socketInstance);
		})
		.then(execLogs => {
			/*
			 * execLogs contains the output of the submission, time for execution, and other details
			 */
			times.executionTime = execLogs.executionTime;
			const response = {
				compilationWarnings,
				error: null,
				...execLogs,
				...times,
			};
			logger.info("Response to the client:", response);
			return res.status(200).json(response);
		})
		.catch(error => {
			/*
			 * error.compilationError contains any possible compilation error, ...
			 * ... rejected by compileInCppContainer
			 */
			if (error.compilationError) {
				// fetch compilationTime that was rejected along with ...
				// ... compilationError as {compilationError, compilationTime}
				times = {
					...times,
					compilationTime: error.compilationTime,
				};
				return handleCompilationError(
					req,
					res,
					next,
					times,
					error.compilationError,
					compilationWarnings
				);
			}
			/*
			 * error.linkerError contains any possible linker error, rejected by ...
			 * ... linkInCppContainer
			 */
			if (error.linkerError) {
				// fetch linkTime that was rejected along with ...
				// ... linkerError as {linkerError, linkTime}
				times = {
					...times,
					linkTime: error.linkTime,
				};
				return handleLinkerError(
					req,
					res,
					next,
					times,
					error.linkerError,
					compilationWarnings
				);
			}
			/*
			 * Check if error occurred due to a non-existent container ...
			 * or an idle (not-running) container
			 */
			if (
				error.error &&
				error.error.message &&
				(error.error.message.includes(
					`No such container: ${req.body.socketId}`
				) ||
					error.error.message.includes("is not running"))
			) {
				return handle403Response(
					res,
					"Wait for socket connection to initialize container environment; or re-establish a socket connection"
				);
			}
			logger.error("Error in handleContainerTasks:", error);
			next(error);
		});
};
