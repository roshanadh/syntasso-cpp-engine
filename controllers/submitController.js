const {
	buildCppImage,
	createCppContainer,
	startCppContainer,
} = require("../docker/index.js");

const handleConfigZero = (req, res) => {
	buildCppImage(req)
		.then(buildLogs => {
			return createCppContainer(req);
		})
		.then(creationLogs => {
			return handleConfigOne(req, res);
		})
		.catch(error => {
			return res.status(503).json({
				errorInEngine: "Service unavailable due to server conditions",
			});
		});
};

const handleConfigOne = (req, res) => {
	startCppContainer(req)
		.then(startLogs => {
			return res.status(200).json({
				output: startLogs,
			});
		})
		.catch(error => {
			throw error;
		});
};

const handleConfigTwo = (req, res) => {};

module.exports = (req, res) => {
	try {
		const dockerConfig = parseInt(req.body.dockerConfig);
		switch (dockerConfig) {
			case 0:
				handleConfigZero(req, res);
				break;
			case 1:
				handleConfigOne(req, res);
				break;
			case 2:
				handleConfigTwo(req, res);
				break;
		}
	} catch (error) {
		return res.status(503).json({
			errorInEngine: "Service unavailable due to server conditions",
		});
	}
};
