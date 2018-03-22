var port = process.env.port || 80;

var express = require("express");
var app = express();
var server = app.listen(port);
//var bodyParser = require("body-parser");
var socket = require("socket.io");
var io = socket(server);

var crypto = require("crypto");

// Azure SQL DB connection
//const Sequelize = require("sequelize");
//// init DB connection
//const sequelize = new Sequelize("whisperDB", "username", "password", {
//	host: "whisperdb.database.windows.net",
//	dialect: "mssql",
//	operatorsAliases: false,
//
//	pool: {
//		max: 5,
//		min: 0,
//		acquire: 30000,
//		idle: 10000
//	}
//});

function HSLstring(h, s, l) {
	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

var User = function(id, username, color) {
	this.id = id;
	this.username = username;
	this.color = color;
};

crypto.pbkdf2(
	"Password", "salt", 1, 64, "sha512",
	(err, key) => {
		console.log(key.toString("hex"));
	}
);

app.use("/", express.static("public_html"));

io.on("connection", function(socket) {
	var user = new User(socket.id, socket.handshake.query.username, HSLstring((Math.floor(Math.random() * 6) * 60), 100, 85));

	io.emit("newConnection", {
		"user": user
	});
	console.log("New connection: " + user.color);
	socket.on("message", function(e) {
		io.emit("message", {
			"user": user,
			"message": e
		});
	});
	socket.on("command", function(e) {
		var split = e.split(" = ");

		switch (split[0]) {
			case "$myColor":
				if (split[1]) {
					user.color = split[1];
					io.emit("command", {
						"user": user,
						"message": (" just set his color to: " + user.color + " using the $myColor variable")
					});
				} else {
					io.emit("command", {
						"user": user,
						"message": (" color is currently: " + user.color)
					});
				}
				break;
		}
	});
});