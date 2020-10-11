const { exec } = require("child_process");

const { convertTimeToMs } = require("../util/index.js");
module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Starting C++ container...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: "Starting C++ container...",
			});
			let containerStartTime;
			exec(
				`time docker container start ${socketId}`,
				{ shell: "/bin/bash" },
				(error, stdout, stderr) => {
					if (error) {
						console.error(
							"Error while starting C++ container:",
							error
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the starting process
						return reject({ error });
					}
					if (stderr) {
						let times;
						/*
						 * 'time' command returns the real(total), user, and sys(system) ...
						 * ... times for the execution of following command (e.g. docker build ... )
						 * The times are returned in the following structure:
						 * ++++++++++++++++++
						 * + real\t0m0.000s +
						 * + user\t0m0.000s +
						 * + sys\t0m0.000s  +
						 * ++++++++++++++++++
						 * Note: 0m0.000s = 0minutes and 0.000 seconds
						 * We need to extract real(total) time/containerStartTime from the returned timed.
						 * The times are returned as an 'stderr' object
						 */
						try {
							times = stderr.split("\n");
							// get build time in terms of 0m.000s
							containerStartTime = times[1].split("\t")[1];
							console.log(
								`stdout during C++ container start: ${stdout}`
							);
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
							return resolve({
								stdout,
								containerStartTime: convertTimeToMs(
									containerStartTime
								),
							});
						} catch (err) {
							// stderr contains an actual error and not execution times
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
							// ... or an stderr was generated during the starting process
							return reject({ stderr });
						}
					}
				}
			);
		} catch (error) {
			console.error("Error in startCppContainer:", error);
			return reject({ error });
		}
	});
};
