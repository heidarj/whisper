var express = require("express");
var app = express();
var server = app.listen(3000);
//var bodyParser = require("body-parser");
var socket = require("socket.io");
var io = socket(server);

app.use("/", express.static("public_html"));

io.on("connection", function(socket) {
	socket.broadcast.emit("newConnection", socket.client.id);
	console.log("New connection: " + socket.client.id);
	socket.on("message", e => {
		io.emit("message", e);
	});
});