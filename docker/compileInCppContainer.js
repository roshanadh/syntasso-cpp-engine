const { exec } = require("child_process");

const copyClientFilesToCppContainer = require("./copyClientFilesToCppContainer.js");

const compileSubmission = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		try {
			const { socketId } = req.body;
			console.log("Compiling .cpp submission inside container...");
			socketInstance.instance.to(socketId).emit("docker-app-stdout", {
				stdout: "Compiling .cpp submission inside container...",
			});
			exec(
				`docker exec -i ${socketId} g++ ${socketId}.cpp -o submission`,
				(error, stdout, stderr) => {
					if (stderr) {
						// stderr contains compilation errors and warnings
						console.error(
							"stderr while compiling submission:",
							stderr
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stderr while compiling submission: ${stderr}`,
							});
						// resolve an object with keys stdout and stderr both, because this ...
						// ... makes it easier to check later if a compilation error/warning ...
						// ... occurred or not during the compilation process
						return resolve({
							stderr,
							stdout: stdout ? stdout : null,
						});
					}
					if (error) {
						// error contains compilation errors and warnings but ...
						// ... along with the Node.js error stack, which is not needed ...
						// ... so we use stderr for resolving compilation errors and ...
						// ... warnings
						console.error(
							"Error while compiling submission:",
							error
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ error });
					}
					console.log(
						`stdout during compilation of submission: ${stdout}`
					);
					console.log(`${socketId}.cpp compiled.`);
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `stdout during compilation of submission: ${stdout}`,
						});
					socketInstance.instance
						.to(socketId)
						.emit("docker-app-stdout", {
							stdout: `${socketId}.cpp compiled.`,
						});
					// resolve an object with keys stdout and stderr both, because this ...
					// ... makes it easier to check later if a compilation error/warning ...
					// ... occurred or not during the compilation process
					return resolve({ stdout, stderr: stderr ? stderr : null });
				}
			);
		} catch (error) {
			console.error("Error in compileInCppContainer:", error);
			return reject({ error });
		}
	});
};

module.exports = (req, socketInstance) => {
	return new Promise((resolve, reject) => {
		copyClientFilesToCppContainer(req)
			.then(copyLogs => compileSubmission(req, socketInstance))
			.then(compilationLogs => resolve(compilationLogs))
			.catch(error => {
				// at this point, error is already an object, so no need to wrap it in ...
				// ... braces like reject({error})
				return reject(error);
			});
	});
};
