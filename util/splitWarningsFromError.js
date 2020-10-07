module.exports = (stderr, socketId) => {
	// return the error substring and warnings substring from a combined stack
	/*
	 * Filter warnings and error from a combined warning + error stack such as:
	 * 	s-6e8b4c6b70bbb4f18b.cpp:1:23: warning: extra tokens at end of #include directive
	 *  #include<iostream>int main() {}
	 *                        ^~~~
	 * s-6e8b4c6b70bbb4f18b.cpp:1:32: fatal error: iostream>in: No such file or directory
	 *  #include<iostream>int main() {}
	 *                                 ^
	 * compilation terminated.
	 */
	try {
		const tokens = stderr.split(`${socketId}.cpp:`);
		// returns an array after splitting
		// filter tokens array to remove any empty elements
		const nonEmptyTokens = tokens.filter(element => element);
		let warningsSubstring = null,
			errorSubstring = null;
		for (let i = 0; i < nonEmptyTokens.length; i++) {
			let token = nonEmptyTokens[i];
			if (token.includes("fatal error") || token.includes("error")) {
				errorSubstring = `${socketId}.cpp:${token}`;
				break;
			}
		}
		warningsSubstring = stderr.replace(errorSubstring, "");
		return {
			warningsSubstring,
			errorSubstring,
		};
	} catch (error) {
		console.error("Error in splitWarningsFromError:", error);
		return {
			errorInParser: error,
		};
	}
};
