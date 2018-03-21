var express = require("express");
var app = express();
var server = app.listen(3000);
//var bodyParser = require("body-parser");
var socket = require("socket.io");
var io = socket(server);

function HSLstring(h, s, l) {
	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

var User = function(id, username, color) {
	this.id = id;
	this.username = username;
	this.color = color;
};

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