const {
	createSubmissionFilePath,
	generateSubmissionFile,
	createTestFilesPath,
	generateTestFiles,
} = require("../filesystem/index.js");
const {
	handleConfigZero,
	handleConfigOne,
	handleConfigTwo,
} = require("../handlers/index.js");

module.exports = (req, res, next) => {
	try {
		createSubmissionFilePath(req.body.socketId)
			.then(() => generateSubmissionFile(req))
			.then(() => createTestFilesPath(req.body.socketId))
			.then(() => generateTestFiles(req))
			.then(() => {
				{
					const dockerConfig = parseInt(req.body.dockerConfig);
					switch (dockerConfig) {
						case 0:
							// pass empty object as "times" argument, since no times ...
							// ... have been recorded as of yet
							handleConfigZero(req, res, next, {});
							break;
						case 1:
							// pass empty object as "times" argument, since no times ...
							// ... have been recorded as of yet
							handleConfigOne(req, res, next, {});
							break;
						case 2:
							// pass empty object as "times" argument, since no times ...
							// ... have been recorded as of yet
							handleConfigTwo(req, res, next, {});
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
