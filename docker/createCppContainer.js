const { exec } = require("child_process");

const removeCppContainer = require("./removeCppContainer.js");

module.exports = req => {
	return new Promise((resolve, reject) => {
		try {
			removeCppContainer(req.body.socketId)
				.then(removalLogs => {
					console.log("Creating a C++ container...");
					exec(
						`docker create -it --name ${req.body.socketId} img_cpp`,
						(error, stdout, stderr) => {
							if (error) {
								console.error(
									"Error while creating C++ container:",
									error
								);
								// reject an object with keys error or stderr, because this ...
								// ... makes it easier to check later if an error occurred ...
								// ... or an stderr was generated during the build process
								return reject({ error });
							}
							if (stderr) {
								console.error(
									"stderr while creating C++ container:",
									stderr
								);
								// reject an object with keys error or stderr, because this ...
								// ... makes it easier to check later if an error occurred ...
								// ... or an stderr was generated during the build process
								return reject({ stderr });
							}
							console.log(
								`stdout during C++ container creation: ${stdout}`
							);
							console.log("C++ container created.");
							return resolve(stdout);
						}
					);
				})
				.catch(error => {
					return reject(error);
				});
		} catch (error) {
			console.error("Error in createCppContainer:", error);
			return reject({ error });
		}
	});
};
