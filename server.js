var port = process.env.port || 80;

var secretKey = process.env.SECRET_KEY || "secret";
var salt = process.env.SALT || "salt";

var crypto = require("crypto");

var saltnhash = function(pass, callback) {
	crypto.pbkdf2(
		pass, salt, 1, 64, "sha512", (err, key) => {
			if (err) {
				console.log(err);
			}
			callback(key);
		});
};

// Azure SQL DB connection
const Sequelize = require("sequelize");
// init DB connection
const sequelize = new Sequelize("whisperDB", process.env.AZURE_DB_USERNAME, process.env.AZURE_DB_PASSWORD, {
	host: "whisperdb.database.windows.net",
	dialect: "mssql",
	operatorsAliases: false,
	dialectOptions: {
		encrypt: true
	},
	logging: false,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
});

sequelize.authenticate().then(() => {
	console.log("DB connection has been established successfully.");
}).catch(err => {
	console.error("Unable to connect to the database:", err);
	throw err;
});

var User = sequelize.import("./sequelize_models/user.js");

sequelize.sync({
	force: true
});

var express = require("express");
var app = express();

var jwt = require("jsonwebtoken");

var server = app.listen(port);
var bodyParser = require("body-parser");
var socket = require("socket.io");
var io = socket(server);

io.use((socket, next) => {
	let token = socket.handshake.query.token;
	if (token) {
		jwt.verify(token, secretKey, (err) => {
			if (err) {
				return next(new Error("authentication error"));
			} else {
				return next();
			}
		});
	} else {
		return next(new Error("authentication error"));
	}

});

var jsonParser = bodyParser.json();

// serve everything in public_html as the root by default
app.use("/", express.static("public_html"));




app.get("/auth", (req, res) => {
	let auth = req.get("Authorization");
	if (auth) {
		let token = auth.split(" ")[1];
		jwt.verify(token, secretKey, (err) => {
			if (err) {
				res.status(401).send("Invalid token");
			} else {
				res.status(200).send("Authorized");
			}
		});
	}
});

app.post("/auth", (req, res) => {
	let auth = req.get("Authorization");
	if (auth) {
		let credentials = auth.split(" ")[1];
		let [username, password] = new Buffer(credentials, "base64").toString().split(":");
		User.findOne({
			where: {
				username: username
			}
		}).then(user => {

			if (user != null) {
				saltnhash(password, (pw) => {
					if (pw.toString("hex") === user.password) {
						res.status(200).send(createToken(user));
					} else {
						res.status(401).send("Incorrect username or password");
					}
				});
			} else {
				res.status(401).send("Incorrect username or password");
			}
		});
	} else {
		res.status(400).send("No credentials received");
	}
});

function createToken(user) {
	let userObject = {
		username: user.username,
		id: user.id,
		isAdmin: user.admin
	};

	let token = jwt.sign(userObject, secretKey, {
		expiresIn: "1h"
	});

	return token;
}

app.post("/signup", jsonParser, (req, res) => {
	if (!req.body) {
		res.status(400).send("No content received");
	}

	saltnhash(req.body.password, (key) => {
		User.create({
			username: req.body.username,
			password: key.toString("hex"),
			email: req.body.email
		}).then(user => {
			res.status(201).send(createToken(user));
		}).catch(err => {
			console.log(err);
			if (err.name == "SequelizeUniqueConstraintError" || err.name == "SequelizeValidationError") {
				res.status(409).send(err);
			} else {
				res.status(500).send(err);
			}
		});
	});
});

connectedUsers = [];

// socket handler for the chat
var chat = io.of("/chat").on("connection", function(socket) {

	let token = socket.handshake.query.token;
	decoded = jwt.verify(token, secretKey);
	let user;
	User.findOne({
		where: {
			username: decoded.username
		},
		attributes: ["username", "avatar", "admin"]
	}).then(instance => {
		user = instance;
		connectedUsers.push(user.username);
		chat.emit("newConnection", {
			"user": user,
			"connectedUsers": connectedUsers
		});
	});

	socket.on("message", function(e) {
		chat.emit("message", {
			"user": user,
			"message": e
		});
	});

	socket.on("disconnect", function() {
		connectedUsers.splice(connectedUsers.indexOf(user.username), 1);
		chat.emit("userDisconnect", {
			"user": user,
			"connectedUsers": connectedUsers
		});
	});

	socket.on("typing", function() {
		chat.emit("typing", user);
	});
});