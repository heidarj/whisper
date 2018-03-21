var username = document.getElementById("username");
var submitUsername = document.getElementById("submitUsername");
var socket;

username.onkeydown = function(e) {
	if (e.keyCode == 13 && username.value) {
		connectSocket();
	}
};
submitUsername.onclick = function() {
	if (username.value) {
		connectSocket();
	}
};

var chatconsole = document.getElementById("chatconsole");
var inputbox = document.getElementById("inputbox");
var messages = document.getElementById("messages");

chatconsole.onclick = function() {
	inputbox.focus();
};

messages.onclick = function() {
	return null;
};

inputbox.onkeydown = function(e) {
	if (e.keyCode == 13) {
		sendMessage();
	}
};

function sendMessage() {
	if (inputbox.value) {
		switch (inputbox.value[0]) {
			case "$":
				socket.emit("command", inputbox.value);
				break;
			default:
				socket.emit("message", inputbox.value);
				break;
		}
		inputbox.value = "";
	}
}

function addMessage(user, message, color) {
	var li = document.createElement("li");
	li.innerHTML = formatUsername(user, color) + " > " + message;
	messages.appendChild(li);
	chatconsole.scrollTo(0, chatconsole.scrollHeight);
}

function connectSocket() {
	socket = io(("http://localhost:3000/?username=" + username.value)); // eslint-disable-line
	document.body.removeChild(document.getElementById("loginOverlay"));

	socket.on("message", function(e) {
		addMessage(e.user.username, e.message, e.user.color);
	});

	socket.on("newConnection", function(e) {
		addMessage("server", (formatUsername(e.user.username, e.user.color) + " has connected"));
	});

	socket.on("command", function(e) {
		addMessage("server", (formatUsername(e.user.username, e.user.color) + e.message));
	});

}

var formatUsername = function(username, color) {
	return "<i style='color: " + (color ? color : "#00FFFF") + ";'>" + username + "</i>";
};