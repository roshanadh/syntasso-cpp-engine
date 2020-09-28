const { exec } = require("child_process");

module.exports = req => {
	return new Promise((resolve, reject) => {
		try {
			exec(
				`docker container start ${req.body.socketId}`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							"Error while starting C++ container:",
							error
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ error });
					}
					if (stderr) {
						console.error(
							"stderr while starting C++ container:",
							stderr
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ stderr });
					}
					console.log(`stdout during C++ container start: ${stdout}`);
					console.log("C++ container started.");
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.error("Error in startCppContainer:", error);
			return reject({ error });
		}
	});
};
