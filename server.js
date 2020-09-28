const express = require("express");
const bodyParser = require("body-parser");

const router = require("./routes/router.js");

const app = express();
app.set("json spaces", 2);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

const PORT = 8082;
app.listen(PORT, () =>
	console.log(`Syntasso C++ Engine is now listening on port ${PORT}...`)
);
