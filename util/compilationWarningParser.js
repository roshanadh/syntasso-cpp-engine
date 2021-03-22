const { logger } = require("./index.js");

module.exports = (stderr, socketId) => {
	// Parses compilation warnings encountered in compileInCppContainer process
	/*
	 * compilation warnings sample:
	 * In function 'int main()':
	 * s-5acd159664c5437161.cpp:5:5: warning: unused variable 'a' [-Wunused-variable]
	 *  int a = 6;
	 *      ^
	 * s-5acd159664c5437161.cpp:6:5: warning: unused variable 'b' [-Wunused-variable]
	 *  int b = 10;
	 *      ^
	 *
	 * Here we see two warnings in the same stderr
	 * We need to parse two warning objects from the above stderr, each ...
	 * ... separated by regex /(s-5acd159664c5437161.cpp:\d+:\d+:)/g
	 */
	try {
		const warningRegex = new RegExp(
			`(${socketId}.cpp:\\d+:\\d+: warning: )`,
			"g"
		);
		let matches = [...stderr.matchAll(warningRegex)];

		/*
		 * At the end of this forEach block, ...
		 * matches = [
		 * 	{ header: 's-5acd159664c5437161.cpp:3:12: warning: ', index: 44 },
		 * 	{ header: 's-5acd159664c5437161.cpp:3:5: warning: ', index: 145 }
		 * ]
		 */
		matches.forEach((match, index) => {
			matches[index] = {
				header: match[0],
				index: match.index,
			};
		});

		const warnings = [];
		for (let i = 0; i < matches.length; i++) {
			// parse each warning
			let lineNumber, columnNumber, warningMessage, fullWarning;

			lineNumber = matches[i].header
				.split(`${socketId}.cpp:`)[1]
				.split(":")[0];
			columnNumber = matches[i].header
				.split(`${socketId}.cpp:${lineNumber}:`)[1]
				.split(":")[0];
			warningMessage = stderr
				.substring(matches[i].index + matches[i].header.length)
				.split("\n")[0];

			fullWarning =
				// if current item is the last entry in matches array, ...
				// ... no need to specify the end index for substring
				i === matches.length - 1
					? stderr.substring(matches[i].index)
					: stderr.substring(matches[i].index, matches[i + 1].index);

			if (isNaN(lineNumber) || isNaN(columnNumber)) {
				warnings[i] = {
					fullWarning,
				};
			} else {
				warnings[i] = {
					lineNumber: parseInt(lineNumber),
					columnNumber: parseInt(columnNumber),
					warningMessage,
					fullWarning,
				};
			}
		}
		return {
			warningStack: stderr,
			warnings,
		};
	} catch (error) {
		logger.error(`error in compilationWarningParser.js:`, error);
		return {
			errorInParser: error,
		};
	}
};
