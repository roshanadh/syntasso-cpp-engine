const {
	buildCppImage,
	createCppContainer,
	startCppContainer,
	compileInCppContainer,
	execInCppContainer,
} = require("../docker/index.js");
const {
	createSubmissionFilePath,
	generateSubmissionFile,
} = require("../filesystem/index.js");
const { compilationWarningParser } = require("../util/index.js");

const handleConfigZero = (req, res, next) => {
	const { socketInstance } = require("../server.js");
	buildCppImage(req, socketInstance)
		.then(buildLogs => {
			return createCppContainer(req, socketInstance);
		})
		.then(creationLogs => {
			return handleConfigOne(req, res, next);
		})
		.catch(error => {
			next(error);
		});
};

const handleConfigOne = (req, res, next) => {
	const { socketInstance } = require("../server.js");
	startCppContainer(req, socketInstance)
		.then(startLogs => {
			return handleConfigTwo(req, res, next);
		})
		.catch(error => {
			next(error);
		});
};

const handleConfigTwo = (req, res, next) => {
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
			return execInCppContainer(req, socketInstance);
		})
		.then(execLogs => {
			/*
			 * execLogs.stdout contains the output of the submission
			 * execLogs.stderr contains any possible errors during execution
			 */
			const response = {
				compilationWarnings,
				execLogs,
			};
			console.log("Response to the client:", response);
			return res.status(200).json(response);
		})
		.catch(error => {
			/*
			 * error.compilationError contains any possible compilation error
			 */
			if (error.compilationError) {
				const response = {
					compilationWarnings,
					error: error.compilationError,
					errorType: "compilation-error",
				};
				console.log("Response to the client:", response);
				return res.status(200).json(response);
			}
			next(error);
		});
};

module.exports = (req, res, next) => {
	try {
		createSubmissionFilePath(req.body.socketId)
			.then(submissionFilePath => generateSubmissionFile(req))
			.then(fileName => {
				{
					const dockerConfig = parseInt(req.body.dockerConfig);
					switch (dockerConfig) {
						case 0:
							handleConfigZero(req, res, next);
							break;
						case 1:
							handleConfigOne(req, res, next);
							break;
						case 2:
							handleConfigTwo(req, res, next);
							break;
					}
				}
			})
			.catch(error => {
				error.status = 503;
				next(error);
			});
	} catch (error) {
		error.status = 503;
		next(error);
	}
};
