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
	} catch (err) {
		console.error(`error in linkerErrorParser:`, err);
		return { errorInParser: err };
	}
};
