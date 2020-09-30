socketIdValidator = req => {
	const { socketInstance } = require("../server.js");
	const listOfClients = Object.keys(socketInstance.instance.sockets.sockets);

	if (!req.body.socketId) return "no-socket";
	if (!listOfClients.includes(req.body.socketId)) return "unknown-socket";
	req.session.socketId = req.body.socketId;
};

const dockerConfigValidator = req => {
	if (!req.body.dockerConfig) return "no-config";
	else if (isNaN(req.body.dockerConfig)) return "NaN";
	else if (![0, 1, 2].includes(parseInt(req.body.dockerConfig)))
		return "no-valid-config";
	else return "ok";
};
const codeValidator = req => (req.body.code ? true : false);

module.exports = (req, res, next) => {
	console.log("POST request received at /submit");
	switch (socketIdValidator(req)) {
		case "no-socket":
			return res.status(400).json({
				error: "No socket ID provided",
			});
		case "unknown-socket":
			return res.status(401).json({
				error: "Socket ID not recognized",
			});
		default:
			break;
	}
	if (!codeValidator(req))
		return res.status(400).json({
			error: "No code provided",
		});
	switch (dockerConfigValidator(req)) {
		case "no-config":
			return res.status(400).json({
				error: "No dockerConfig provided",
			});
		case "NaN":
			return res.status(400).json({
				error: "dockerConfig should be a number; got NaN",
			});
		case "no-valid-config":
			return res.status(400).json({
				error: "dockerConfig should be one of [0, 1, 2]",
			});
		default:
			break;
	}
	next();
};
