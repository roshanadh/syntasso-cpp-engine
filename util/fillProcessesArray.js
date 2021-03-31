/**
 *
 * @param {*} parsedCompilationError
 * @param {*} testCasesCount
 * @returns processes[]
 *
 * Fill processes array with n process JSON objects, for n test cases
 * Each process JSON object contains the parsed compilation error object, among others
 */
module.exports = (parsedCompilationError, testCasesCount) => {
	let processes = [];
	for (let i = 0; i < testCasesCount; i++) {
		processes.push({
			id: i,
			testStatus: false,
			timedOut: false,
			sampleInput: null,
			expectedOutput: null,
			exception: null,
			observedOutputTooLong: false,
			executionTimeForProcess: null,
			error: {
				errorType: "compilation-error",
				...parsedCompilationError,
			},
		});
	}

	return processes;
};
