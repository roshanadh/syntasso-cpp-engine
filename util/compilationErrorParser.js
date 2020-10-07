const getErrorFromCombinedStack = (stderr, socketId) => {
	const tokens = stderr.split(`${socketId}.cpp:`);
	// returns an array after splitting
	// filter tokens array to remove any empty elements
	const nonEmptyTokens = tokens.filter(element => element);
	let fatalError = null;
	for (let i = 0; i < nonEmptyTokens.length; i++) {
		let token = nonEmptyTokens[i];
		if (token.includes("fatal error") || token.includes("error")) {
			console.dir({
				msg: "Fatal error found",
				token: `${socketId}.cpp:${token}`,
			});
			fatalError = `${socketId}.cpp:${token}`;
			break;
		}
	}
	return fatalError;
};

const parse = (stderr, regexMatchResult) => {
	/*
	 * Parses the lineNumber, columnNumber, and errorMessage from an error stack
	 */
	let lineNumber = null,
		columnNumber = null,
		errorMessage = null;

	let header = regexMatchResult[0];
	/*
	 * If RegExp(`(${socketId}.cpp:\\d+:\\d+: error: )`) matched in the original stderr, ...
	 * ... header === "s-02c34e5658faf8e781.cpp:5:2: error: "
	 * If RegExp(`(${socketId}.cpp:\\d+:\\d+: )`) matched in the original stderr, ...
	 * ... header ===  "s-02c34e5658faf8e781.cpp:5:2:"
	 */
	let index = regexMatchResult.index;
	lineNumber = header.split(":")[1];
	columnNumber = header.split(":")[2];
	errorMessage = stderr.substring(index + header.length).split("\n")[0];
	return {
		lineNumber,
		columnNumber,
		errorMessage,
	};
};

module.exports = (stderr, socketId) => {
	/*
	 * Parse the stderr string object to extract;
	 * lineNumber, columnNumber, errorMessage, errorStack
	 *
	 * Note: Proceed with compilationErrorParser only if it has been detected ...
	 * ... that there's indeed an error in stderr, that is to prevent any unforeseen ...
	 * ... errors in this process
	 */
	try {
		/*
		 * Combined warning + error stack:
		 * 	s-6e8b4c6b70bbb4f18b.cpp:1:23: warning: extra tokens at end of #include directive
		 *  #include<iostream>int main() {}
		 *                        ^~~~
		 * s-6e8b4c6b70bbb4f18b.cpp:1:32: fatal error: iostream>in: No such file or directory
		 *  #include<iostream>int main() {}
		 *                                 ^
		 * compilation terminated.
		 */
		// First, try to parse the error from combined stack, look for 'error', ...
		// ... or 'fatal error' keywords, ignoring the adjoining warning
		// TODO: Also fetch warnings from the combined stack and include in response
		const _error = getErrorFromCombinedStack(stderr, socketId);
		if (_error) stderr = _error;
		// start parsing for lineNumber, columnNumber, and errorMessage
		let _parsed;
		// search for substring "s-02c34e5658faf8e781.cpp:5:2: error"
		let substringWithErrorRegex = new RegExp(
			`(${socketId}.cpp:\\d+:\\d+: error: )`
		);
		// search for substring "s-02c34e5658faf8e781.cpp:5:2: fatal error"
		let substringWithFatalErrorRegex = new RegExp(
			`(${socketId}.cpp:\\d+:\\d+: fatal error: )`
		);
		// search for substring "s-02c34e5658faf8e781.cpp:5:2: "
		let substringWithoutErrorRegex = new RegExp(
			`(${socketId}.cpp:\\d+:\\d+: )`
		);
		const regexes = [
			substringWithErrorRegex,
			substringWithFatalErrorRegex,
			substringWithoutErrorRegex,
		];
		// filter array to get one regex that matches with the stderr
		const matchingRegexes = regexes.filter(regex => stderr.match(regex));
		if (matchingRegexes.length === 1 || matchingRegexes.length > 1) {
			// even if more than one regex are present in stderr, parse ...
			// ... using the first matching regex
			let regexMatchResult = stderr.match(matchingRegexes[0]);
			_parsed = parse(stderr, regexMatchResult);
		} else {
			return {
				errorInParser: "Invalid length of matchingRegexes:",
				matchingRegexes,
			};
		}
		return {
			..._parsed,
			errorStack: stderr,
		};
	} catch (err) {
		return {
			errorInParser: err,
		};
	}
};
