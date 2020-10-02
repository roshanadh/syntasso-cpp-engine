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
			error.status = 503;
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
			error.status = 503;
			next(error);
		});
};

const handleConfigTwo = (req, res, next) => {
	const { socketInstance } = require("../server.js");
	let compilationWarnings, error;
	compileInCppContainer(req, socketInstance)
		.then(compilationLogs => {
			/*
			 * compilationLogs.stdout contains the output of compilation
			 * compilationLogs.stderr contains any possible compilation errors/warnings
			 */
			return execInCppContainer(req, socketInstance);
		})
		.then(execLogs => {
			/*
			 * execLogs.stdout contains the output of the submission
			 * execLogs.stderr contains any possible errors during execution
			 */
			return res.status(200).json({
				execLogs,
				compilationLogs,
			});
		})
		.catch(error => {
			error.status = 503;
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
