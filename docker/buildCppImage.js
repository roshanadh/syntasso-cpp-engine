const { exec } = require("child_process");

module.exports = req => {
	return new Promise((resolve, reject) => {
		try {
			console.log("Building a C++ image...");
			const buildProcess = exec(
				`docker build -t img_cpp .`,
				(error, stdout, stderr) => {
					if (error) {
						console.error("Error while building C++ image:", error);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ error });
					}
					if (stderr) {
						console.error(
							"stderr while building C++ image:",
							stderr
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ stderr });
					}
					console.log("C++ image built.");
					return resolve(stdout);
				}
			);
			buildProcess.stdout.on("data", stdout => {
				console.log(stdout);
			});
		} catch (error) {
			console.error("Error in buildCppContainer:", error);
			return reject({ error });
		}
	});
};
