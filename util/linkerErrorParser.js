const { logger } = require("./index.js");

module.exports = stderr => {
	try {
		let errorMessage,
			errorStack = stderr;
		// search for any instances of "undefined" as in "undefined reference to 'foo'"
		const index = stderr.indexOf("undefined");
		if (index !== -1) {
			errorMessage = stderr.substring(index).split("\n")[0];
			return {
				errorMessage,
				errorStack,
			};
		}
		return {
			errorStack,
		};
	} catch (error) {
		logger.error(`Error in linkerErrorParser:`, error);
		return { errorInParser: error };
	}
};
