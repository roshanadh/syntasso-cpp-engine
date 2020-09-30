const socket = require("socket.io");
const cryptoRandomString = require("crypto-random-string");

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

			socket.on("disconnect", reason => {
				console.log(
					`\nDISCONNECT: Socket disconnected with id ${socket.id}`
				);
				console.log(`REASON: ${reason}\n`);
			});
		});
	}
}

module.exports = Socket;
