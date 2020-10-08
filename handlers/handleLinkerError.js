const { linkerErrorParser } = require("../util/index.js");

module.exports = (req, res, next, linkerError, compilationWarnings) => {
	try {
		const _parsedError = linkerErrorParser(linkerError);
		if (_parsedError.errorInParser) return next(_parsedError.errorInParser);
		const response = {
			compilationWarnings,
			error: { ..._parsedError, errorType: "linker-error" },
		};
		console.log("Response to the client:", response);
		return res.json(response);
	} catch (error) {
		console.error("Error in handleLinkerError:", error);
		next(error);
	}
};
