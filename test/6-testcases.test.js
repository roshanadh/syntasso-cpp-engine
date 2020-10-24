const { server, chai, mocha, should, expect } = require("./test-config.js");

describe("Test output of test cases at /submit:", () => {
	let socket, socketId;
	before(async () => {
		const { getConnection } = require("./test-config.js");
		socket = await getConnection();
		socketId = socket.id;
	});
	it("should respond with testStatus = true", done => {
		const payload = {
			socketId,
			// stub with code to calculate area of a rectangle
			code: `#include<iostream>\n #include<string>\n #include<vector>\n using namespace std;\n const int SAMPLE_INPUT_MAX_LINES = 500; vector<string> sampleInput; size_t currentLine = 0; bool parse_raw_sample_input(string rawSampleInput); vector<string> split(string str, string delimiter); string read_line(); int calc_area(int length, int breadth) { return length * breadth; } int main(int argc, char *argv[]) { if (argc == 2) { string rawSampleInput = argv[1]; bool isParsed = parse_raw_sample_input(rawSampleInput); if (!isParsed) { cerr << "Length of sample input lines exceeded 500"; return -1; } int length = stoi(read_line()); int breadth = stoi(read_line()); int output = calc_area(length, breadth); cout << output; } else if (argc > 2) { cerr << "Too many inputs provided"; } else { cerr << "No input provided"; } } bool parse_raw_sample_input(string rawInput) { sampleInput = split(rawInput, "\\n"); if (sampleInput.size() > SAMPLE_INPUT_MAX_LINES) return false; return true; } string read_line() { if (currentLine == sampleInput.size()) return ""; return sampleInput.at(currentLine++); } vector<string> split(string str, string delimiter) { size_t position = str.find(delimiter); vector<string> tokens; string token; string remainingString = str; while (position != string::npos) { token = remainingString.substr(0, position); remainingString = remainingString.substr(position + 1); tokens.push_back(token); position = remainingString.find(delimiter); } if (position == string::npos) tokens.push_back(remainingString); return tokens; }`,
			testCases: [{ sampleInput: "5\n2", expectedOutput: "10" }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.processes[0].testStatus).to.be.true;
				done();
			});
	});
	it("should respond with testStatus = false", done => {
		const payload = {
			socketId,
			// stub with code to calculate area of a rectangle
			code: `#include<iostream>\n #include<string>\n #include<vector>\n using namespace std;\n const int SAMPLE_INPUT_MAX_LINES = 500; vector<string> sampleInput; size_t currentLine = 0; bool parse_raw_sample_input(string rawSampleInput); vector<string> split(string str, string delimiter); string read_line(); int calc_area(int length, int breadth) { return length * breadth; } int main(int argc, char *argv[]) { if (argc == 2) { string rawSampleInput = argv[1]; bool isParsed = parse_raw_sample_input(rawSampleInput); if (!isParsed) { cerr << "Length of sample input lines exceeded 500"; return -1; } int length = stoi(read_line()); int breadth = stoi(read_line()); int output = calc_area(length, breadth); cout << output; } else if (argc > 2) { cerr << "Too many inputs provided"; } else { cerr << "No input provided"; } } bool parse_raw_sample_input(string rawInput) { sampleInput = split(rawInput, "\\n"); if (sampleInput.size() > SAMPLE_INPUT_MAX_LINES) return false; return true; } string read_line() { if (currentLine == sampleInput.size()) return ""; return sampleInput.at(currentLine++); } vector<string> split(string str, string delimiter) { size_t position = str.find(delimiter); vector<string> tokens; string token; string remainingString = str; while (position != string::npos) { token = remainingString.substr(0, position); remainingString = remainingString.substr(position + 1); tokens.push_back(token); position = remainingString.find(delimiter); } if (position == string::npos) tokens.push_back(remainingString); return tokens; }`,
			testCases: [{ sampleInput: "5\n20", expectedOutput: "10" }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.processes[0].testStatus).to.be.false;
				done();
			});
	});
	it("should respond with timedOut = true", done => {
		const payload = {
			socketId,
			// print i after an infinite loop
			code: `#include <iostream>\nusing namespace std;\nint main(){int i; for (i = 0; i < 1; i--) {} cout<<i;}`,
			testCases: [{ sampleInput: 0, expectedOutput: 0 }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.timeOutLength).to.equal(2000);
				expect(res.body.observedOutputMaxLength).to.equal(2000);
				expect(res.body.processes[0].timedOut).to.be.true;
				expect(res.body.processes[0].observedOutputTooLong).to.be.false;
				expect(res.body.processes[0].testStatus).to.be.false;
				done();
			});
	});
	it("should respond with observedOutputTooLong = true", done => {
		const payload = {
			socketId,
			// print i inside an infinite loop
			code: `#include <iostream>\nusing namespace std;\nint main(){int i; for (i = 0; i < 1; i--) {cout<<i;} }`,
			testCases: [{ sampleInput: 0, expectedOutput: 0 }],
		};
		chai.request(server)
			.post("/submit")
			.send(payload)
			.end((err, res) => {
				console.dir(payload);
				expect(err).to.be.null;
				res.body.should.be.a("object");
				res.body.sampleInputs.should.equal(1);
				expect(res.body.error).to.be.null;
				expect(res.body.timeOutLength).to.equal(2000);
				expect(res.body.observedOutputMaxLength).to.equal(2000);
				expect(res.body.processes[0].timedOut).to.be.true;
				expect(res.body.processes[0].observedOutputTooLong).to.be.true;
				expect(res.body.processes[0].testStatus).to.be.false;
				done();
			});
	});
});
