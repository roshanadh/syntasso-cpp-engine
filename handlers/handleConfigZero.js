const { buildCppImage, createCppContainer } = require("../docker/index.js");

const handleConfigOne = require("./handleConfigOne.js");

module.exports = (req, res, next) => {
	const { socketInstance } = require("../server.js");
	buildCppImage(req, socketInstance)
		.then(buildLogs => {
			return createCppContainer(req, socketInstance);
		})
		.then(creationLogs => {
			return handleConfigOne(req, res, next);
		})
		.catch(error => {
			console.error("Error in handleConfigZero:", error);
			next(error);
		});
};
