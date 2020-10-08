const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test submission programs at /submit:", () => {
	let socket, socketId;
	before(async () => {
		const { getConnection } = require("./test-config.js");
		socket = await getConnection();
		socketId = socket.id;
	});
	describe("Compilation error tests:", () => {
		it("should respond with errorType = compilation-error for syntax error", done => {
			const payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout << "Hello World!"\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
		it("should respond with errorType = compilation-error for linking unknown library", done => {
			const payload = {
				socketId,
				code: `#include<randomlib>\nusing namespace std;\nint main() {\ncout << "Hello World!";\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
		it("should respond with errorType = compilation-error for div-by-zero", done => {
			const payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\nint a = 10 / 0;\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
					done();
				});
		});
		it("should respond with errorType = compilation-error for reference to undeclared function", done => {
			const payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main(){\nfoo();\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
		it("should respond with errorType = compilation-error and parse warnings from a combined stack", done => {
			const payload = {
				socketId,
				code: `#include<iostream> int main(){\nint a; int b;\n}`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					expect(res.body.compilationWarnings).to.not.be.null;
					expect(
						res.body.compilationWarnings.warnings.length
					).to.equal(1);
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("compilation-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
	});

	describe("Linker error tests:", () => {
		it("should respond with errorType = linker-error for main function not found", done => {
			const payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("linker-error");
					done();
				});
		});
		it("should respond with errorType = linker-error for undefined function", done => {
			const payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nvoid foo();\nint main(){\nfoo();\n}\nvoid foo();`,
				dockerConfig: "2",
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(err).to.be.null;
					res.body.should.be.a("object");
					res.body.error.should.be.a("object");
					res.body.error.errorType.should.equal("linker-error");
					expect(res.body.error.lineNumber).to.not.be.NaN;
					expect(res.body.error.columnNumber).to.not.be.NaN;
					done();
				});
		});
	});

	describe("Runtime error tests:", () => {
		// TODO: Write runtime error tests
	});
});
