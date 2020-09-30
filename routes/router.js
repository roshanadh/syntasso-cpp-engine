const express = require("express");
const router = express.Router();

const paramValidator = require("../middlewares/paramValidator.js");
const submitController = require("../controllers/submitController.js");

router.get("/", (req, res) => {
	console.log("GET request received at /");
	res.json({
		message: "Hello World!",
	});
});

router.post("/submit", paramValidator, submitController);

router.use((error, req, res, next) => {
	// this is the error-handling middleware
	console.error("Error caught by the error-handling middleware:", error);
	return res.status(error.status || 503).json({
		errorInEngine:
			error.message || "Service unavailable due to server conditions",
	});
});

module.exports = router;
