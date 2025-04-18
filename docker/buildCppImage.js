const { exec } = require("child_process");

const { convertTimeToMs, logger } = require("../util/index.js");

module.exports = (socketId, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			logger.info("Building a C++ image...");
			socketInstance.to(socketId).emit("docker-app-stdout", {
				stdout: `Building a C++ image...`,
			});
			let imageBuildTime;
			const buildProcess = exec(
				`time docker build -t img_cpp .`,
				{ shell: "/bin/bash" },
				(error, stdout, stderr) => {
					if (error) {
						logger.error("Error while building C++ image:", error);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
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
						 * We need to extract real(total) time/imageBuildTime from the returned timed.
						 * The times are returned as an 'stderr' object
						 */
						try {
							times = stderr.split("\n");
							// get build time in terms of 0m.000s
							imageBuildTime = times[1].split("\t")[1];
							logger.info("C++ image built.");
							socketInstance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: "C++ image built.",
								});
							return resolve({
								stdout,
								imageBuildTime: convertTimeToMs(imageBuildTime),
							});
						} catch (err) {
							// stderr contains an actual error and not execution times
							logger.error(
								"stderr while building C++ image:",
								stderr
							);
							socketInstance
								.to(socketId)
								.emit("docker-app-stdout", {
									stdout: `stderr while building C++ image: ${stderr}`,
								});
							// reject an object with keys error or stderr, because this ...
							// ... makes it easier to check later if an error occurred ...
							// ... or an stderr was generated during the build process
							return reject({ stderr });
						}
					}
				}
			);
			buildProcess.stdout.on("data", stdout => {
				logger.info(stdout);
				socketInstance.to(socketId).emit("docker-app-stdout", {
					stdout,
				});
			});
		} catch (error) {
			logger.error("Error in buildCppImage:", error);
			return reject({ error });
		}
	});
};
