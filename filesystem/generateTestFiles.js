const fs = require("fs");
const path = require("path");

module.exports = req => {
	return new Promise((resolve, reject) => {
		// at this point, both sampleInputs and expectedOutputs dirs have ...
		// ... been created, so write files inside the directories
		const { socketId, testCases } = req.body;
		const sampleInputsDirPath = path.resolve(
			__dirname,
			"..",
			"client-files",
			socketId,
			"sampleInputs"
		);
		const expectedOutputsDirPath = path.resolve(
			__dirname,
			"..",
			"client-files",
			socketId,
			"expectedOutputs"
		);
		let sampleInputFilePath, expectedOutputFilePath;
		try {
			console.log(
				`Generating test case files for socket ID: ${socketId}...`
			);
			testCases.forEach((element, index) => {
				sampleInputFilePath = path.resolve(
					sampleInputsDirPath,
					`${socketId}-sampleInput-${index}.txt`
				);
				expectedOutputFilePath = path.resolve(
					expectedOutputsDirPath,
					`${socketId}-expectedOutput-${index}.txt`
				);
				try {
					fs.writeFileSync(
						sampleInputFilePath,
						element.sampleInput.toString()
					);
					console.log(
						`${socketId}-sampleInput-${index}.txt generated.`
					);
					fs.writeFileSync(
						expectedOutputFilePath,
						element.expectedOutput.toString()
					);
					console.log(
						`${socketId}-expectedOutput-${index}.txt generated.`
					);
				} catch (error) {
					console.error(
						`Error while writing to test case files for socketId ${socketId}:`,
						error
					);
					return reject({ errorInGenerateTestFiles: error });
				}
			});
			console.log(`Test case files generated for socket ID ${socketId}.`);
			return resolve(true);
		} catch (error) {
			console.error(`Error in generateTestFiles:`, error);
			return reject({ errorInGenerateTestFiles: error });
		}
	});
};
