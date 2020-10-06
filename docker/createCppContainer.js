const { exec } = require("child_process");

const removeCppContainer = require("./removeCppContainer.js");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			removeCppContainer(socketId)
				.then(removalLogs => {
					console.log("Creating a C++ container...");
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: "Creating a C++ container...",
						});
					exec(
						`docker create -it --name ${socketId} img_cpp`,
						(error, stdout, stderr) => {
							if (error) {
								console.error(
									"Error while creating C++ container:",
									error
								);
								// reject an object with keys error or stderr, because this ...
								// ... makes it easier to check later if an error occurred ...
								// ... or an stderr was generated during the creation process
								return reject({ error });
							}
							if (stderr) {
								console.error(
									"stderr while creating C++ container:",
									stderr
								);
								socketInstance.instance
									.to(socketId)
									.emit("docker-app-stdout", {
										stdout: `stderr while creating C++ container: ${stderr}`,
									});
								// reject an object with keys error or stderr, because this ...
								// ... makes it easier to check later if an error occurred ...
								// ... or an stderr was generated during the creation process
								return reject({ stderr });
							}
							console.log(
								`stdout during C++ container creation: ${stdout}`
							);
							console.log("C++ container created.");
							socketInstance.instance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: `stdout during C++ container creation: ${stdout}`,
								});
							socketInstance.instance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: "C++ container created.",
								});
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
