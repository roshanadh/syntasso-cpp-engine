const { exec } = require("child_process");

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Linking the object file inside container...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: "Linking the object file inside container...",
			});
			exec(
				`docker exec -i ${socketId} g++ ${socketId}.o -o submission`,
				(error, stdout, stderr) => {
					if (stderr) {
						console.error(
							`stderr while linking ${socketId}.o:`,
							stderr
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while linking object file: ${stderr}`,
							});
						/*
						 * reject an object with key 'linkerError' because it makes distinguishing the ...
						 * ... type of error easier when handling promise rejections inside submitController
						 */
						return reject({ linkerError: stderr });
					}
					if (error) {
						console.error(
							`Error while linking ${socketId}.o:`,
							error
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `Error while linking object file: ${stderr}`,
							});
						/*
						 * reject an object with key 'linkerError' because it makes distinguishing the ...
						 * ... type of error easier when handling promise rejections inside submitController
						 */
						return reject({
							linkerError: error,
						});
					}
					// at this point, linking has completed without any errors ...
					if (stdout) {
						console.log(
							`stdout during linking of object file: ${stdout}`
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stdout during linking of object file: ${stdout}`,
							});
					}
					console.log(`${socketId}.o file linked.`);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `${socketId}.o file linked.`,
						});
					return resolve({ stdout });
				}
			);
		} catch (error) {
			console.error("Error in linkInCppContainer:", error);
			return reject({ error });
		}
	});
};
