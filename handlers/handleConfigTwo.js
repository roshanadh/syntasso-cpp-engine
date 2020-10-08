const {
	compileInCppContainer,
	linkInCppContainer,
	execInCppContainer,
} = require("../docker/index.js");

const handleCompilationError = require("./handleCompilationError.js");

const handleLinkerError = require("./handleLinkerError.js");

const { compilationWarningParser } = require("../util/index.js");

module.exports = (req, res, next) => {
	const { socketInstance } = require("../server.js");
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
			return linkInCppContainer(req, socketInstance);
		})
		.then(linkLogs => {
			/*
			 * linkInCppContainer.stdout contains the output of linking
			 * linkInCppContainer rejects any error as {error}
			 */
			return execInCppContainer(req, socketInstance);
		})
		.then(execLogs => {
			/*
			 * execLogs.stdout contains the output of the submission
			 * execLogs.stderr contains any possible errors during execution
			 */
			const response = {
				compilationWarnings,
				output: execLogs.stdout,
			};
			console.log("Response to the client:", response);
			return res.status(200).json(response);
		})
		.catch(error => {
			/*
			 * error.compilationError contains any possible compilation error, ...
			 * ... rejected by compileInCppContainer
			 */
			if (error.compilationError) {
				return handleCompilationError(
					req,
					res,
					next,
					error.compilationError,
					compilationWarnings
				);
			}
			/*
			 * error.linkerError contains any possible linker error, rejected by ...
			 * ... linkInCppContainer
			 */
			if (error.linkerError) {
				return handleLinkerError(
					req,
					res,
					next,
					error.linkerError,
					compilationWarnings
				);
			}
			console.error("Error in handleConfigTwo:", error);
			next(error);
		});
};
