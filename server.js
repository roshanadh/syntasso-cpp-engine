const express = require("express");
const bodyParser = require("body-parser");

const { PORT } = require("./config.js");
const router = require("./routes/router.js");

const app = express();
app.set("json spaces", 2);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

app.listen(PORT, () =>
	console.log(`Syntasso C++ Engine is now listening on port ${PORT}...`)
);
