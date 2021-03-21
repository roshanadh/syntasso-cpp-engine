const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);

const { logger } = require("./util/index.js");

const {
	PORT,
	CLIENT_PROTOCOL,
	CLIENT_HOST,
	CLIENT_PORT,
	SECRET_SESSION_KEY,
	REDIS_STORE_HOST,
	REDIS_STORE_PORT,
} = require("./config.js");
const router = require("./routes/router.js");

const app = express();
app.set("json spaces", 2);
app.use(
	cors({
		credentials: true,
		origin: `${CLIENT_PROTOCOL}://${CLIENT_HOST}:${CLIENT_PORT}`,
	})
);
app.use(
	session({
		secret: SECRET_SESSION_KEY,
		store: new RedisStore({
			host: REDIS_STORE_HOST,
			port: REDIS_STORE_PORT,
			client: redis.createClient(),
		}),
		saveUninitialized: false,
		resave: false,
	})
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(router);

const server = app.listen(PORT, () =>
	logger.info(`Syntasso C++ Engine is now listening on port ${PORT}...`)
);

const socketInstance = new (require("./socket/socket.js"))(server).instance;

module.exports = {
	server,
	socketInstance,
};
