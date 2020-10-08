const {
	compilationWarningParser,
	compilationErrorParser,
	splitWarningsFromError,
} = require("../util/index.js");

module.exports = (req, res, next, compilationError, compilationWarnings) => {
	/*
	 * Sometimes, compilation warnings and the compilation error are adjoined in ...
	 * ... a single stderr.
	 * This stderr is then rejected as compilationError, to be passed to this function
	 * So, we should split them apart, before parsing them separately.
	 */
	try {
		const _splitStack = splitWarningsFromError(
			compilationError,
			req.body.socketId
		);
		if (_splitStack.errorInParser) return next(_splitStack.errorInParser);
		let { warningsSubstring, errorSubstring } = _splitStack;
		let _parsedWarnings = null;
		if (warningsSubstring) {
			// parse the warnings substring
			_parsedWarnings = compilationWarningParser(
				warningsSubstring,
				req.body.socketId
			);
		}
		// parse the error substring
		const _parsedError = compilationErrorParser(
			errorSubstring,
			req.body.socketId
		);
		if (_parsedError.errorInParser) return next(_parsedError.errorInParser);
		const response = {
			compilationWarnings: compilationWarnings
				? compilationWarningParser
				: _parsedWarnings,
			error: { ..._parsedError, errorType: "compilation-error" },
		};
		console.log("Response to the client:", response);
		return res.json(response);
	} catch (error) {
		console.error("Error in handleCompilationError:", error);
		next(error);
	}
};
