const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Executing submission inside container...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: "Executing submission inside container...",
			});
			exec(
				`docker exec -i ${socketId} ./submission`,
				(error, stdout, stderr) => {
					if (stderr) {
						// stderr contains execution errors and warnings
						console.error(
							"stderr while executing submission:",
							stderr
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while executing submission: ${stderr}`,
							});
						// resolve an object with keys stdout and stderr both
						return resolve({
							stderr,
							stdout: stdout ? stdout : null,
						});
					}
					if (error) {
						console.error(
							"Error while executing submission:",
							error
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the execution process
						return reject({ error });
					}
					if (stdout) {
						console.log(
							`stdout during execution of submission: ${stdout}`
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stdout during execution of submission: ${stdout}`,
							});
					}
					console.log(`Submission from ${socketId} executed.`);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `Submission from ${socketId} executed.`,
						});
					// resolve an object with keys stdout and stderr both
					return resolve({ stdout, stderr: stderr ? stderr : null });
				}
			);
		} catch (error) {
			console.error("Error in execInCppContainer:", error);
			return reject({ error });
		}
	});
};
