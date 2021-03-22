const { exec } = require("child_process");
const { performance } = require("perf_hooks");

const { logger } = require("../util/index.js");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			let linkTime = performance.now();
			const { socketId } = req.body;
			logger.info("Linking the object file inside container...");
			socketInstance.to(socketId).emit("docker-app-stdout", {
				stdout: "Linking the object file inside container...",
			});
			exec(
				`docker exec -i ${socketId} g++ ${socketId}.o -o submission`,
				(error, stdout, stderr) => {
					linkTime = performance.now() - linkTime;
					if (stderr) {
						logger.error(
							`stderr while linking ${socketId}.o:`,
							stderr
						);
						socketInstance.to(socketId).emit("docker-app-stdout", {
							stdout: `stderr while linking object file: ${stderr}`,
						});
						/*
						 * reject an object with key 'linkerError' because it makes distinguishing the ...
						 * ... type of error easier when handling promise rejections inside submitController
						 */
						return reject({ linkerError: stderr, linkTime });
					}
					if (error) {
						logger.error(
							`Error while linking ${socketId}.o:`,
							error
						);
						socketInstance.to(socketId).emit("docker-app-stdout", {
							stdout: `Error while linking object file: ${stderr}`,
						});
						/*
						 * reject an object with key 'linkerError' because it makes distinguishing the ...
						 * ... type of error easier when handling promise rejections inside submitController
						 */
						return reject({
							linkerError: error,
							linkTime,
						});
					}
					// at this point, linking has completed without any errors ...
					if (stdout) {
						logger.info(
							`stdout during linking of object file: ${stdout}`
						);
						socketInstance.to(socketId).emit("docker-app-stdout", {
							stdout: `stdout during linking of object file: ${stdout}`,
						});
					}
					logger.info(`${socketId}.o file linked.`);
					socketInstance.to(socketId).emit("docker-app-stdout", {
						stdout: `${socketId}.o file linked.`,
					});
					return resolve({ stdout, linkTime });
				}
			);
		} catch (error) {
			logger.error("Error in linkInCppContainer:", error);
			return reject({ error });
		}
	});
};
