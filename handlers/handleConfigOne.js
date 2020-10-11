const { startCppContainer } = require("../docker/index.js");

const handleConfigTwo = require("./handleConfigTwo.js");
const handleBadDockerConfig = require("./handleBadDockerConfig.js");

module.exports = (req, res, next, times) => {
	const { socketInstance } = require("../server.js");
	startCppContainer(req, socketInstance)
		.then(startLogs => {
			times.containerStartTime = startLogs.containerStartTime;
			return handleConfigTwo(req, res, next, times);
		})
		.catch(error => {
			/*
			 * Check if error occurred due to a bad dockerConfig value
			 */
			if (
				error.error &&
				error.error.message.includes(
					`No such container: ${req.session.socketId}`
				)
			) {
				return handleBadDockerConfig(
					res,
					"Re-request using dockerConfig 0 because container has not been created"
				);
			}
			console.error("Error in handleConfigOne:", error);
			next(error);
		});
};
