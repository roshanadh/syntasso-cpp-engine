const mocha = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const io = require("socket.io-client");

const { server } = require("../server.js");

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

// console.log = msg => {};

let socket;

createConnection = async () => {
	socket = await io.connect("http://localhost:8082");
	return socket;
};

removeConnection = async () => {
	let socketId = socket.id;
	if (socket.connected) {
		socket.disconnect();
		return { socket, socketId };
	} else {
		console.error("Socket connection doesn't exist.");
		return null;
	}
};

getConnection = () => socket;

module.exports = {
	server,
	mocha,
	chai,
	should,
	expect,
	createConnection,
	getConnection,
	removeConnection,
};
