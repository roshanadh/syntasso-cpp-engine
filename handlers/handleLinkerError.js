const { linkerErrorParser, logger } = require("../util/index.js");

module.exports = (
	req,
	res,
	next,
	_socketInstance,
	times,
	linkerError,
	compilationWarnings
) => {
	try {
		const _parsedError = linkerErrorParser(linkerError);
		if (_parsedError.errorInParser) return next(_parsedError.errorInParser);
		const response = {
			compilationWarnings,
			error: { ..._parsedError, errorType: "linker-error" },
			// send empty processes array
			processes: [],
			...times,
		};

		emitErrorBeforeExecEvent(
			_socketInstance.socketId,
			_socketInstance.socketInstance,
			req.body.testCases.length
		);
		logger.info("Response to the client:", response);
		return res.json(response);
	} catch (error) {
		logger.error("Error in handleLinkerError:", error);
		next(error);
	}
};
