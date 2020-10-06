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
			/*
			 * Using the following g++ flags:
			 * -Wall: Enable most of the warnings
			 * -Wfatal-errors: Stop compilation after detecting a fatal error
			 * -Werror=div-by-zero: Stop compilation after a div-by-zero is detected
			 */
			exec(
				`docker exec -i ${socketId} g++ ${socketId}.cpp -o submission -Wall -Wfatal-errors -Werror=div-by-zero`,
				(error, stdout, stderr) => {
					/*
					 * Note: In the following context, the term 'exists' implies that ...
					 * ... a variable is either not null or not empty.
					 * *
					 * If a compilation warning is detected, 'stderr' exists but 'error' ...
					 * ... doesn't.
					 * If a compilation error is detected, both 'stderr' and 'error' exist.
					 * *
					 * error exists in case the compilation process, i.e., the 'docker exec' ...
					 * ... command is not completed, ...
					 * ... hence the 'submission' file is not created.
					 * *
					 * stderr exists in case of any compilation warnings, after the execution of ...
					 * ... the 'docker exec' command, or compilation errors, hence the ...
					 * ... submission file may or may not be created.
					 * *
					 * This means that, whenever 'error' exists, 'submission' file is not ...
					 * ... created, and this can be treated as either a compilation error, ...
					 * ... or an error during execution of 'docker exec' command.
					 * *
					 */
					// error contains compilation errors, just like stderr, but ...
					// ... along with the Node.js error stack, unlike stderr, which is ...
					// ... not needed so we use stderr for rejecting compilation errors and ...
					// ... resolving warnings
					if (!error && stderr) {
						// this is the case of a compilation warning
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
							compilationWarnings: stderr,
						});
					}
					if (error && stderr) {
						// this is the case of a compilation error
						console.error(
							"Error while compiling submission:",
							error
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the compilation process
						return reject({ compilationError: stderr });
					}
					// at this point, compilation has completed without any errors ...
					// ... or warnings
					if (stdout) {
						console.log(
							`stdout during compilation of submission: ${stdout}`
						);
						socketInstance.instance
							.to(socketId)
							.emit("docker-app-stdout", {
								stdout: `stdout during compilation of submission: ${stdout}`,
							});
					}
					console.log(`${socketId}.cpp compiled.`);
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
