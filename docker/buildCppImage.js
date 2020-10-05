const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Building a C++ image...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: `Building a C++ image...`,
			});
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
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while building C++ image: ${stderr}`,
							});
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ stderr });
					}
					console.log("C++ image built.");
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: "C++ image built.",
						});
					return resolve(stdout);
				}
			);
			buildProcess.stdout.on("data", stdout => {
				console.log(stdout);
				socketInstance.instance.to(socketId).emit("docker-app-stdout", {
					stdout,
				});
			});
		} catch (error) {
			console.error("Error in buildCppContainer:", error);
			return reject({ error });
		}
	});
};
