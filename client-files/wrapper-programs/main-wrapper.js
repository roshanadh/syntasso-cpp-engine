"use strict";

process.on("uncaughtException", error => {
	process.stderr.write(
		Buffer.from(
			JSON.stringify({
				error: {
					message: error.message,
					name: error.name,
					stack: error.stack,
				}
			})
		)
	);
});

const { spawnSync } = require("child_process");

const cppProcess = spawnSync("./submission");

const io = cppProcess.output;
let [stdin, stdout, stderr] = io;

stdout = stdout.toString();
stderr = stderr.toString();

if (stderr.trim() !== "") {
	process.stderr.write(
		Buffer.from(
			JSON.stringify({
				stderr: stderr
			})
		)
	);
} else {
	process.stdout.write(
		Buffer.from(
			JSON.stringify({
				stdout: stdout,
			})
		)
	);
}
