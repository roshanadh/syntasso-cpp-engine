const { startCppContainer } = require("../docker/index.js");

const handleConfigTwo = require("./handleConfigTwo.js");

module.exports = (req, res, next) => {
	const { socketInstance } = require("../server.js");
	startCppContainer(req, socketInstance)
		.then(startLogs => {
			return handleConfigTwo(req, res, next);
		})
		.catch(error => {
			console.error("Error in handleConfigTwo:", error);
			next(error);
		});
};
