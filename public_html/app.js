var socket = io();

var chatconsole = document.getElementById("chatconsole");
var messagebox = document.getElementById("messagebox");
var messages = document.getElementById("messages");

chatconsole.onclick = function() {
	messagebox.focus();
};

messages.onclick = function() {
	return null;
};

messagebox.onkeydown = function(e) {
	if (e.keyCode == 13) {
		sendMessage();
	}
};

function sendMessage() {
	if (messagebox.value) {
		socket.emit("message", messagebox.value);
		messagebox.value = "";
	}
}

socket.on("message", function(e) {
	var li = document.createElement("li");
	li.innerHTML = e;
	messages.appendChild(li);
});