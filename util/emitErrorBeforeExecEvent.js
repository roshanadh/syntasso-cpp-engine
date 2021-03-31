/**
 *
 * @param {*} socketId
 * @param {*} socketInstance
 * @param {*} event
 *
 * Emit n test-status socket events for n test cases on compilation/linker errors
 */
module.exports = (socketId, socketInstance, testCasesCount) => {
	return new Promise((resolve, reject) => {
		for (let i = 0; i < testCasesCount; i++) {
			socketInstance.to(socketId).emit("test-status", {
				type: "test-status",
				process: i,
				testStatus: false,
				timedOut: false,
				observedOutputTooLong: false,
			});
		}
		resolve(true);
	});
};
