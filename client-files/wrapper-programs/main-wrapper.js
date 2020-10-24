"use strict";

const writeErrorToStderr = error => {
	process.stderr.write(
		Buffer.from(
			JSON.stringify({
				message: error.message,
				name: error.name,
				stack: error.stack,
			})
		)
	);
};

process.on("uncaughtException", error => writeErrorToStderr);

const { spawnSync } = require("child_process");
const { performance } = require("perf_hooks");

const readTestFiles = require("./read-test-files.js");

const socketId = process.env.socketId.trim();

// execution of each submission file times out after a certain period
const EXECUTION_TIME_OUT_IN_MS = parseInt(process.env.EXECUTION_TIME_OUT_IN_MS);
// max length of stdout for each cppProcess
const MAX_LENGTH_STDOUT = parseInt(process.env.MAX_LENGTH_STDOUT);

let sampleInputs,
	expectedOutputs,
	sampleInputFileContents,
	expectedOutputFileContents,
	executionTimesForProcesses = [],
	// response object to be sent to the process that executes main-wrapper.js
	response = {
		timeOutLength: EXECUTION_TIME_OUT_IN_MS,
		observedOutputMaxLength: MAX_LENGTH_STDOUT,
	};

try {
	readTestFiles(socketId)
		.then(response => {
			({ sampleInputs, expectedOutputs } = response);
			main();
		})
		.catch(err => {
			// TODO: handle different promise rejections from readTestFiles
			if (
				err.message === "No test files have been generated" ||
				err.message ===
					"Number of sampleInput and expectedOutput files mismatch"
			) {
				// spawn one process and do not pass any sample input to it
				try {
					let startTime = performance.now();

					const cppProcess = spawnSync("./submission", {
						timeout: EXECUTION_TIME_OUT_IN_MS,
					});
					let executionTimeForProcess = performance.now() - startTime;
					const io = cppProcess.output;
					const stdout =
						io[1].toString().length <= MAX_LENGTH_STDOUT
							? io[1].toString()
							: null;
					const stderr =
						io[2].toString().trim() !== ""
							? io[2].toString().trim()
							: null;
					// testStatus will be null because no test files have been ...
					// ... generated
					const testStatus = null;
					response = {
						type: "full-response",
						sampleInputs: 0,
						testStatus,
						// if cppProcess timed out, its signal would be SIGTERM by default ...
						// ... otherwise, its signal would be null
						timedOut:
							cppProcess.signal === "SIGTERM" ? true : false,
						timeOutLength: EXECUTION_TIME_OUT_IN_MS,
						expectedOutput: null,
						observedOutput: stdout,
						// any stderr generated from the submission file is an exception thrown
						exception: stderr,
						// if length of stdout is larger than MAX length permitted, ...
						// ... set stdout as null and specify reason in response object
						observedOutputTooLong: stdout === null ? true : false,
						observedOutputMaxLength: MAX_LENGTH_STDOUT,
						executionTimeForProcess,
					};
					process.stdout.write(Buffer.from(JSON.stringify(response)));
				} catch (err) {
					writeErrorToStderr(err);
				}
			} else writeErrorToStderr(err);
		});
} catch (error) {
	writeErrorToStderr(error);
}

const main = () => {
	// assign value to 'sampleInputs' key in response
	let len_sampleInputs = sampleInputs.length;
	response["sampleInputs"] = len_sampleInputs;
	// spawn n processes to execute submission n times for n sampleInputs
	for (let i = 0; i < len_sampleInputs; i++) {
		try {
			let startTime = performance.now();
			const cppProcess = spawnSync(
				"./submission",
				[passSampleInputsAsArg(sampleInputs.files[i])],
				{
					timeout: EXECUTION_TIME_OUT_IN_MS,
				}
			);
			executionTimesForProcesses[i] = performance.now() - startTime;
			const io = cppProcess.output;
			const stdout =
				io[1].toString().length <= MAX_LENGTH_STDOUT
					? io[1].toString()
					: null;
			const stderr =
				io[2].toString().trim() !== "" ? io[2].toString().trim() : null;
			expectedOutputFileContents = expectedOutputs.fileContents[
				expectedOutputs.files[i]
			].toString();

			let testStatus =
				expectedOutputFileContents === stdout ? true : false;

			response[`sampleInput${i}`] = {
				testStatus,
				// if cppProcess timed out, its signal would be SIGTERM by default ...
				// ... otherwise, its signal would be null
				timedOut: cppProcess.signal === "SIGTERM" ? true : false,
				sampleInput: sampleInputs.fileContents[
					sampleInputs.files[i]
				].toString(),
				expectedOutput: expectedOutputFileContents.toString(),
				observedOutput: stdout,
				// any stderr generated from the submission file is an exception thrown
				exception: stderr,
				// if length of stdout is larger than MAX length permitted, ...
				// ... set stdout as null and specify reason in response object
				observedOutputTooLong: stdout === null ? true : false,
				executionTimeForProcess: executionTimesForProcesses[i],
			};

			// write to stdout to indicate completion of test #i
			process.stdout.write(
				Buffer.from(
					JSON.stringify({
						type: "test-status",
						process: i,
						testStatus,
						timedOut:
							cppProcess.signal === "SIGTERM" ? true : false,
						observedOutputTooLong: stdout === null ? true : false,
					})
				)
			);
		} catch (err) {
			return writeErrorToStderr(err);
		}
	}
	// write the final response to stdout
	process.stdout.write(
		Buffer.from(JSON.stringify({ type: "full-response", ...response }))
	);
};

const passSampleInputsAsArg = sampleInput => {
	// pass sample inputs as command-line arguments
	sampleInputFileContents = sampleInputs.fileContents[sampleInput].toString();
	return sampleInputFileContents;
};
