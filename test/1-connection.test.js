const { mocha, chai, should, expect, server } = require("./test-config.js");

describe("Test connection:", () => {
	let socket;
	before(async () => {
		const { createConnection } = require("./test-config.js");
		socket = await createConnection();
	});

	describe("Test socket connection to http://localhost:8082", () => {
		it("should be connected to a socket", done => {
			expect(socket.connected).to.be.true;
			done();
		});
	});
});
