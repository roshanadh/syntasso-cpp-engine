const { linkerErrorParser, logger } = require("../util/index.js");

module.exports = (req, res, next, times, linkerError, compilationWarnings) => {
	try {
		const _parsedError = linkerErrorParser(linkerError);
		if (_parsedError.errorInParser) return next(_parsedError.errorInParser);
		const response = {
			compilationWarnings,
			error: { ..._parsedError, errorType: "linker-error" },
			...times,
		};
		logger.info("Response to the client:", response);
		return res.json(response);
	} catch (error) {
		logger.error("Error in handleLinkerError:", error);
		next(error);
	}
};
