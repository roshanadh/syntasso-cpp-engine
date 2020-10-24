const {
	buildCppImage,
	createCppContainer,
	startCppContainer,
} = require("../docker/index.js");

module.exports = (socketId, socketInstance) => {
	return new Promise((resolve, reject) => {
		let times = {};
		socketInstance.to(socketId).emit("container-init-status", {
			status: "building",
			message: "Building a C++ image...",
			error: null,
		});
		buildCppImage(socketId, socketInstance)
			.then(buildLogs => {
				times.imageBuildTime = buildLogs.imageBuildTime;
				socketInstance.to(socketId).emit("container-init-status", {
					status: "creating",
					message: "Creating a C++ container...",
					error: null,
				});
				return createCppContainer(socketId, socketInstance);
			})
			.then(creationLogs => {
				times.containerCreateTime = creationLogs.containerCreateTime;
				socketInstance.to(socketId).emit("container-init-status", {
					status: "starting",
					message: "Starting the C++ container...",
					error: null,
				});
				return startCppContainer(socketId, socketInstance);
			})
			.then(startLogs => {
				times.containerStartTime = startLogs.containerStartTime;
				socketInstance.to(socketId).emit("container-init-status", {
					status: "ready",
					message: "Container is ready.",
					error: null,
				});
				// "container-ready-status" event is strictly for testing
				// clients may only listen for the "container-init-status" events
				socketInstance.to(socketId).emit("container-ready-status", {
					status: "ready",
					message: "Container is ready.",
					error: null,
				});
				return resolve(socketId);
			})
			.catch(error => {
				if (
					error.error &&
					error.error.message &&
					error.error.message.includes(
						`The container name "/${socketId}" is already in use by container`
					)
				) {
					// do nothing as this error was caused by trying to ...
					// ... to create a container that already exists
				} else {
					console.error("Error in initContainer:", error);
					socketInstance.to(socketId).emit("container-init-status", {
						status: "error",
						message: "Please re-try creating a socket connection",
						error,
					});
					reject(error);
				}
			});
	});
};
