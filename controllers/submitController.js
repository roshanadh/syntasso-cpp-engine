const {
	buildCppImage,
	createCppContainer,
	startCppContainer,
	compileInCppContainer,
	linkInCppContainer,
	execInCppContainer,
} = require("../docker/index.js");
const {
	createSubmissionFilePath,
	generateSubmissionFile,
} = require("../filesystem/index.js");
const {
	compilationWarningParser,
	compilationErrorParser,
	linkerErrorParser,
	splitWarningsFromError,
} = require("../util/index.js");

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
				execLogs,
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
				/*
				 * Sometimes, compilation warnings and the compilation error are adjoined in ...
				 * ... a single stderr.
				 * This stderr is then rejected as error.compilationError
				 * So, we should split them apart, before parsing them separately.
				 */
				const {
					warningsSubstring,
					errorSubstring,
				} = splitWarningsFromError(
					error.compilationError,
					req.body.socketId
				);
				// parse the warnings substring
				const _parsedWarnings = compilationWarningParser(
					warningsSubstring,
					req.body.socketId
				);
				// parse the error substring
				const _parsedError = compilationErrorParser(
					errorSubstring,
					req.body.socketId
				);
				if (_parsedError.errorInParser) return next(error);
				const response = {
					compilationWarnings: compilationWarnings
						? compilationWarningParser
						: _parsedWarnings,
					error: _parsedError,
					errorType: "compilation-error",
				};
				console.log("Response to the client:", response);
				return res.status(200).json(response);
			}
			/*
			 * error.linkerError contains any possible linker error, rejected by ...
			 * ... linkInCppContainer
			 */
			if (error.linkerError) {
				const _parsedError = linkerErrorParser(error.linkerError);
				if (_parsedError.errorInParser) return next(error);
				const response = {
					compilationWarnings,
					error: _parsedError,
					errorType: "linker-error",
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
