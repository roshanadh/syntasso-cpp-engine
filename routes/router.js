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

module.exports = router;
