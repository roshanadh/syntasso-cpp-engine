const {
	buildCppImage,
	createCppContainer,
	startCppContainer,
} = require("../docker/index.js");
const {
	createSubmissionFilePath,
	generateSubmissionFile,
} = require("../filesystem/index.js");

const handleConfigZero = (req, res, next) => {
	buildCppImage(req)
		.then(buildLogs => {
			return createCppContainer(req);
		})
		.then(creationLogs => {
			return handleConfigOne(req, res);
		})
		.catch(error => {
			error.status = 503;
			next(error);
		});
};

const handleConfigOne = (req, res, next) => {
	startCppContainer(req)
		.then(startLogs => {
			return res.status(200).json({
				output: startLogs,
			});
		})
		.catch(error => {
			error.status = 503;
			next(error);
		});
};

const handleConfigTwo = (req, res, next) => {};

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
