const fs = require("fs");
const path = require("path");

const { logger } = require("../util/index.js");

module.exports = socketId => {
	return new Promise(async (resolve, reject) => {
		try {
			await require("./removeTestFiles.js")(socketId);
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
			logger.info(
				`Creating test case files path for socket ID: ${socketId}...`
			);
			fs.mkdir(sampleInputsDirPath, { recursive: true }, err => {
				if (err) {
					// do nothing if path already exists
					if (err.code === "EEXIST") {
					} else {
						reject(err);
						throw err;
					}
				}
				fs.mkdir(expectedOutputsDirPath, { recursive: true }, err => {
					if (err) {
						// do nothing if path already exists
						if (err.code === "EEXIST") {
						} else {
							reject(err);
							throw err;
						}
					}
					logger.info(
						`Test case files path created for socket ID: ${socketId}.`
					);
					return resolve(true);
				});
			});
		} catch (error) {
			logger.error(`Error inside createTestFilesPath:`, error);
			return reject(error);
		}
	});
};
