const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Starting C++ container...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: "Starting C++ container...",
			});
			exec(
				`docker container start ${socketId}`,
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
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while starting C++ container: ${stderr}`,
							});
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ stderr });
					}
					console.log(`stdout during C++ container start: ${stdout}`);
					console.log("C++ container started.");
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `stdout during C++ container start: ${stdout}`,
						});
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: "C++ container started.",
						});
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.error("Error in startCppContainer:", error);
			return reject({ error });
		}
	});
};
