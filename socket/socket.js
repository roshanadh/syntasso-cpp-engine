const socket = require("socket.io");
const cryptoRandomString = require("crypto-random-string");

const { removeCppContainer } = require("../docker/index.js");
const { cleanUpClientFiles } = require("../filesystem/index.js");
const initContainer = require("./initContainer.js");

class Socket {
	constructor(server) {
		this.instance = socket(server);

		// assign custom socket ID
		// this custom socket ID will also be the unique container name
		this.instance.engine.generateId = () => {
			return `s-${cryptoRandomString({ length: 18, type: "hex" })}`;
		};
		this.instance.on("connection", socket => {
			console.log(
				`\nCONNECTION: New socket connection with id ${socket.id}\n`
			);
			// initialize container for each connection
			initContainer(socket.id, this.instance).catch(error => {
				throw new Error(error);
			});
			// perform cleanup operations after socket disconnect
			socket.on("disconnect", reason => {
				console.log(
					`\nDISCONNECT: Socket disconnected with id ${socket.id}`
				);
				console.log(`REASON: ${reason}\n`);
				removeCppContainer(socket.id).catch(error =>
					console.error(
						`Error during container cleanup after socket ${socket.id} disconnection:`,
						error
					)
				);
				cleanUpClientFiles(socket.id).catch(error =>
					console.error(
						`Error during client-files/ cleanup after socket ${socket.id} disconnection:`,
						error
					)
				);
			});
		});
	}
}

module.exports = Socket;
