const express = require("express");
const router = express.Router();

const { paramValidator, errorHandler } = require("../middlewares/index.js");
const submitController = require("../controllers/submitController.js");

router.get("/", (req, res) => {
	console.log("GET request received at /");
	res.json({
		message: "Hello World!",
	});
});

router.post("/submit", paramValidator, submitController);

router.use(errorHandler);

module.exports = router;
