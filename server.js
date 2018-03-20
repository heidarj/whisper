var express = require("express");
var app = express();
var server = app.listen(3000);
//var bodyParser = require("body-parser");
var socket = require("socket.io");
var io = socket(server);

//app.use(bodyParser.urlencoded({
//	extended: false
//}));

//app.get("/", function(req, res) {
//
//	res.sendFile(__dirname + "/public_html/index.html");
//
//});

app.use("/", express.static("public_html"));

//app.post("/login", function(req, res) {
//	if (req.body) {
//		res.send(req.body.prufi);
//	}
//});


io.on("connection", function() {
	console.log("connection");
});