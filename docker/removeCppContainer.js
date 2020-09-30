const { exec } = require("child_process");

module.exports = socketId => {
	return new Promise((resolve, reject) => {
		try {
			console.log(
				`Removing any existing C++ containers named ${socketId}...`
			);
			exec(
				`docker container rm ${socketId} --force`,
				(error, stdout, stderr) => {
					// even if error occurred, check if the error occurred due to ...
					// ... the container not existing beforehand, making it impossible ...
					// ... to delete the container
					if (
						error &&
						!error.message.includes(
							`No such container: ${socketId}`
						)
					) {
						console.error(
							"Error while removing C++ container:",
							error
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ error });
					}
					if (
						stderr &&
						!error.message.includes(
							`No such container: ${socketId}`
						)
					) {
						console.error(
							"stderr while removing C++ container:",
							stderr
						);
						// reject an object with keys error or stderr, because this ...
						// ... makes it easier to check later if an error occurred ...
						// ... or an stderr was generated during the build process
						return reject({ stderr });
					}
					console.log(
						`stdout during C++ container removal: ${stdout}`
					);
					console.log("C++ container removed.");
					return resolve(stdout);
				}
			);
		} catch (error) {
			console.error("Error in removeCppContainer:", error);
			return reject({ error });
		}
	});
};
