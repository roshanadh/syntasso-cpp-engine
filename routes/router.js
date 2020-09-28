const express = require("express");
const router = express.Router();

const {
	codeValidator,
	dockerConfigValidator,
} = require("../middlewares/paramValidator.js");
const submitController = require("../controllers/submitController.js");

router.get("/", (req, res) => {
	console.log("GET request received at /");
	res.json({
		message: "Hello World!",
	});
});

router.post(
	"/submit",
	(req, res, next) => {
		console.log("POST request received at /submit");

		if (!codeValidator(req))
			return res.status(400).json({
				error: "No code provided",
			});
		switch (dockerConfigValidator(req)) {
			case "no-config":
				return res.status(400).json({
					error: "No dockerConfig provided",
				});
			case "NaN":
				return res.status(400).json({
					error: "dockerConfig should be a number; got NaN",
				});
			case "no-valid-config":
				return res.status(400).json({
					error: "dockerConfig should be one of [0, 1, 2]",
				});
			default:
				break;
		}
		next();
	},
	submitController
);

module.exports = router;
