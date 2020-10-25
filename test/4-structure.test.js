const {
	mocha,
	chai,
	should,
	expect,
	server,
	fs,
	path,
} = require("./test-config.js");

describe("Test response structures for POST /submit", () => {
	let socket, socketId;
	before(() => {
		const { getConnection } = require("./test-config.js");
		socket = getConnection();
		socketId = socket.id;
	});

	describe("POST with clean code at /submit", () => {
		it("should respond with structure for clean compilation and execution", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout<<"Hello World!";\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.should.be.a("object");
					res.body.should.have.property("compilationWarnings");
					res.body.should.have.property("error");
					res.body.should.have.property("timeOutLength");
					res.body.should.have.property("observedOutputMaxLength");
					res.body.should.have.property("sampleInputs");
					res.body.should.have.property("processes");
					res.body.should.have.property("compilationTime");
					res.body.should.have.property("linkTime");
					res.body.should.have.property("executionTime");
					expect(res.body.processes).to.be.an("array");
					expect(res.body.processes.length).to.equal(2);
					res.body.processes.forEach(process => {
						process.should.have.property("id");
						process.should.have.property("testStatus");
						process.should.have.property("timedOut");
						process.should.have.property("sampleInput");
						process.should.have.property("expectedOutput");
						process.should.have.property("observedOutput");
						process.should.have.property("exception");
						process.should.have.property("observedOutputTooLong");
						process.should.have.property("executionTimeForProcess");
					});
					done();
				});
		});

		it("should respond with proper values for each property for clean compilation and execution", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout<<"Hello World!";\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.processes.forEach(process => {
						expect(process.id).to.be.oneOf([0, 1]);
						expect(process.testStatus).to.be.true;
						expect(process.timedOut).to.be.false;
						expect(process.sampleInput).to.be.oneOf(["", "0"]);
						expect(process.expectedOutput).to.equal("Hello World!");
						expect(process.observedOutput).to.equal(
							process.expectedOutput
						);
						expect(process.exception).to.be.null;
						expect(process.observedOutputTooLong).to.be.false;
						expect(process.executionTimeForProcess).to.not.be.NaN;
					});
					expect(res.body.compilationWarnings).to.be.null;
					expect(res.body.error).to.be.null;
					expect(res.body.timeOutLength).to.equal(2000);
					expect(res.body.observedOutputMaxLength).to.equal(2000);
					expect(res.body.sampleInputs).to.equal(2);
					expect(res.body.executionTime).to.not.be.NaN;
					expect(res.body.compilationTime).to.not.be.NaN;
					expect(res.body.linkTime).to.not.be.NaN;
					done();
				});
		});
	});

	describe("POST with warning generating code at /submit", () => {
		it("should respond with structure for compilation warning", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout<<"Hello World!";\nint a;\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.should.be.a("object");
					res.body.should.have.property("compilationWarnings");
					res.body.should.have.property("error");
					res.body.should.have.property("timeOutLength");
					res.body.should.have.property("observedOutputMaxLength");
					res.body.should.have.property("sampleInputs");
					res.body.should.have.property("processes");
					res.body.should.have.property("executionTime");
					res.body.compilationWarnings.should.be.an("object");
					res.body.compilationWarnings.should.have.property(
						"warningStack"
					);
					res.body.compilationWarnings.should.have.property(
						"warnings"
					);
					expect(res.body.compilationWarnings.warnings).to.be.an(
						"array"
					);
					expect(
						res.body.compilationWarnings.warnings.length
					).to.equal(1);
					res.body.compilationWarnings.warnings.forEach(warning => {
						warning.should.have.property("lineNumber");
						warning.should.have.property("columnNumber");
						warning.should.have.property("warningMessage");
						warning.should.have.property("fullWarning");
					});
					expect(res.body.processes).to.be.an("array");
					expect(res.body.processes.length).to.equal(2);
					res.body.processes.forEach(process => {
						process.should.have.property("id");
						process.should.have.property("testStatus");
						process.should.have.property("timedOut");
						process.should.have.property("sampleInput");
						process.should.have.property("expectedOutput");
						process.should.have.property("observedOutput");
						process.should.have.property("exception");
						process.should.have.property("observedOutputTooLong");
						process.should.have.property("executionTimeForProcess");
					});
					done();
				});
		});

		it("should respond with proper values for each property for compilation warning", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout<<"Hello World!";\nint a;\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(res.body.compilationWarnings.warningStack).to.not.be
						.null;
					res.body.compilationWarnings.warnings.forEach(warning => {
						expect(warning.lineNumber).to.equal(5);
						expect(warning.columnNumber).to.equal(5);
						expect(warning.warningMessage).to.equal(
							"unused variable 'a' [-Wunused-variable]"
						);
						expect(warning.fullWarning).to.not.be.null;
					});
					res.body.processes.forEach(process => {
						expect(process.id).to.be.oneOf([0, 1]);
						expect(process.testStatus).to.be.true;
						expect(process.timedOut).to.be.false;
						expect(process.sampleInput).to.be.oneOf(["", "0"]);
						expect(process.expectedOutput).to.equal("Hello World!");
						expect(process.observedOutput).to.equal(
							process.expectedOutput
						);
						expect(process.exception).be.null;
						expect(process.observedOutputTooLong).to.be.false;
						expect(process.executionTimeForProcess).to.not.be.NaN;
					});
					expect(res.body.error).to.be.null;
					expect(res.body.timeOutLength).to.equal(2000);
					expect(res.body.observedOutputMaxLength).to.equal(2000);
					expect(res.body.sampleInputs).to.equal(2);
					expect(res.body.executionTime).to.not.be.NaN;
					expect(res.body.compilationTime).to.not.be.NaN;
					expect(res.body.linkTime).to.not.be.NaN;
					done();
				});
		});
	});

	describe("POST with SyntaxError code at /submit", () => {
		it("should respond with structure for SyntaxError", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout<<"Hello World!";\nint a\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.should.be.a("object");
					res.body.should.have.property("compilationWarnings");
					res.body.should.have.property("error");
					expect(res.body.error).to.be.an("object");

					res.body.error.should.have.property("lineNumber");
					res.body.error.should.have.property("columnNumber");
					res.body.error.should.have.property("errorMessage");
					res.body.error.should.have.property("errorStack");
					res.body.error.should.have.property("errorType");

					res.body.should.have.property("compilationTime");
					done();
				});
		});

		it("should respond with proper values for each property for SyntaxError", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint main() {\ncout<<"Hello World!";\nint a\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(res.body.compilationWarnings).to.be.null;
					expect(res.body.error.lineNumber).to.equal(6);
					expect(res.body.error.columnNumber).to.equal(1);
					expect(res.body.error.errorMessage).to.equal(
						"expected initializer before '}' token"
					);
					expect(res.body.error.errorStack).to.not.be.null;
					expect(res.body.error.errorType).to.equal(
						"compilation-error"
					);
					expect(res.body.compilationTime).to.not.be.NaN;
					done();
				});
		});
	});

	describe("POST with LinkerError code at /submit", () => {
		it("should respond with structure for LinkerError", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint foo() {\ncout<<"Hello World!";\nreturn 1;\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.should.be.a("object");
					res.body.should.have.property("compilationWarnings");
					res.body.should.have.property("error");
					expect(res.body.error).to.be.an("object");

					res.body.error.should.have.property("errorMessage");
					res.body.error.should.have.property("errorStack");
					res.body.error.should.have.property("errorType");

					res.body.should.have.property("compilationTime");
					res.body.should.have.property("linkTime");
					done();
				});
		});

		it("should respond with proper values for each property for LinkerError", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\nint foo() {\ncout<<"Hello World!";\nreturn 1;\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					expect(res.body.compilationWarnings).to.be.null;

					expect(res.body.error.errorMessage).to.equal(
						"undefined reference to `main'"
					);
					expect(res.body.error.errorStack).to.not.be.null;
					expect(res.body.error.errorType).to.equal("linker-error");

					expect(res.body.compilationTime).to.not.be.NaN;
					expect(res.body.linkTime).to.not.be.NaN;
					done();
				});
		});
	});

	describe("POST with exception-throwing at /submit", () => {
		it("should respond with structure for thrown exception", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\ndouble division(int a, int b) {\nif( b == 0 ) {\nthrow "Division by zero condition!";\n}\nreturn (a/b);\n}\nint main () {\nint x = 50;\nint y = 0;\ndouble z = 0;\ncout<<"Hello World!";\ntry {\nz = division(x, y);\ncout << z << endl;\n} catch (const char* msg) {\ncerr << msg << endl;\n}\nreturn 0;\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.should.be.a("object");
					res.body.should.have.property("compilationWarnings");
					res.body.should.have.property("error");
					res.body.should.have.property("timeOutLength");
					res.body.should.have.property("observedOutputMaxLength");
					res.body.should.have.property("sampleInputs");
					res.body.should.have.property("processes");
					res.body.should.have.property("compilationTime");
					res.body.should.have.property("linkTime");
					res.body.should.have.property("executionTime");
					expect(res.body.processes).to.be.an("array");
					expect(res.body.processes.length).to.equal(2);
					res.body.processes.forEach(process => {
						process.should.have.property("id");
						process.should.have.property("testStatus");
						process.should.have.property("timedOut");
						process.should.have.property("sampleInput");
						process.should.have.property("expectedOutput");
						process.should.have.property("observedOutput");
						process.should.have.property("exception");
						process.should.have.property("observedOutputTooLong");
						process.should.have.property("executionTimeForProcess");
					});
					done();
				});
		});

		it("should respond with proper values for each property for thrown exception", done => {
			let payload = {
				socketId,
				code: `#include<iostream>\nusing namespace std;\ndouble division(int a, int b) {\nif( b == 0 ) {\nthrow "Division by zero condition!";\n}\nreturn (a/b);\n}\nint main () {\nint x = 50;\nint y = 0;\ndouble z = 0;\ncout<<"Hello World!";\ntry {\nz = division(x, y);\ncout << z << endl;\n} catch (const char* msg) {\ncerr << msg << endl;\n}\nreturn 0;\n}`,
				testCases: [
					{
						sampleInput: "",
						expectedOutput: "Hello World!",
					},
					{
						sampleInput: "0",
						expectedOutput: "Hello World!",
					},
				],
			};
			chai.request(server)
				.post("/submit")
				.send(payload)
				.end((err, res) => {
					res.body.processes.forEach(process => {
						expect(process.id).to.be.oneOf([0, 1]);
						expect(process.testStatus).to.be.true;
						expect(process.timedOut).to.be.false;
						expect(process.sampleInput).to.be.oneOf(["", "0"]);
						expect(process.expectedOutput).to.equal("Hello World!");
						expect(process.observedOutput).to.equal(
							process.expectedOutput
						);
						expect(process.exception).to.equal(
							"Division by zero condition!"
						);
						expect(process.observedOutputTooLong).to.be.false;
						expect(process.executionTimeForProcess).to.not.be.NaN;
					});
					expect(res.body.compilationWarnings).to.be.null;
					expect(res.body.error).to.be.null;
					expect(res.body.timeOutLength).to.equal(2000);
					expect(res.body.observedOutputMaxLength).to.equal(2000);
					expect(res.body.sampleInputs).to.equal(2);
					expect(res.body.executionTime).to.not.be.NaN;
					expect(res.body.compilationTime).to.not.be.NaN;
					expect(res.body.linkTime).to.not.be.NaN;
					done();
				});
		});
	});
});
