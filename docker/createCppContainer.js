const { exec } = require("child_process");

const removeCppContainer = require("./removeCppContainer.js");
const { convertTimeToMs } = require("../util/index.js");
module.exports = (socketId, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			removeCppContainer(socketId)
				.then(removalLogs => {
					console.log("Creating a C++ container...");
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: "Creating a C++ container...",
						});
					let containerCreateTime;
					exec(
						`time docker create -it --name ${socketId} img_cpp`,
						{ shell: "/bin/bash" },
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
								 * We need to extract real(total) time/containerCreateTime from the returned timed.
								 * The times are returned as an 'stderr' object
								 */
								try {
									times = stderr.split("\n");
									// get build time in terms of 0m.000s
									containerCreateTime = times[1].split(
										"\t"
									)[1];
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
									return resolve({
										stdout,
										containerCreateTime: convertTimeToMs(
											containerCreateTime
										),
									});
								} catch (err) {
									// stderr contains an actual error and not execution times
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
							}
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
