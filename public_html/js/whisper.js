if (localStorage.token) {
	verifyToken(localStorage.token).catch(function(reason) {
		promptLoginRequired(reason);
	});
}

const promptLoginRequired = function(reason) {
	alert("You need to login in before proceeding.\n" + reason);
	window.location = "/";
};

$("#logout").click(function() {
	localStorage.removeItem("token");
	window.location = "/";
});

function verifyToken(token) {
	let isTokenExpired = JSON.parse(atob(token.split(".")[1])).exp < Date.now() / 1000;
	return new Promise((resolve, reject) => {
		if (isTokenExpired) {
			reject("Login token has expired");
		}
		let req = new XMLHttpRequest();
		req.open("GET", "/auth", true);
		req.setRequestHeader("Authorization", ("Bearer " + token));
		req.onload = function() {
			if (req.status == 200) {
				resolve("Token is valid");
			} else {
				reject("Server rejected token");
			}
		};
		req.onerror = function() {
			reject(req.statusText);
		};
		req.send();
	});
}

$(".draggable").draggable({
	handle: ".draggable-handle"
});

var chatconsole = document.getElementById("chatconsole");
var inputbox = document.getElementById("inputbox");
var messages = document.getElementById("messages");

inputbox.onkeydown = function(e) {
	if (e.key == "Enter" && e.shiftKey != true && inputbox.value) {
		verifyToken(localStorage.token).then(function() {
			e.preventDefault();
			chat.emit("message", inputbox.value.replace(/\n/g, "<br>"));
			inputbox.value = "";
		}).catch(function(reason) {
			promptLoginRequired(reason);
		});
	} else {
		chat.emit("typing", "");
	}
};

var chat = io.connect("/chat?token=" + localStorage.token);


chat.on("message", function(e) {
	addMessage(e.user, e.message);
});

var serverUser = {
	username: "server",
	isAdmin: true
};

chat.on("newConnection", function(e) {
	addMessage(serverUser, (e.user.username + " has connected"));
	$("#connectedLobby").text("");
	e.connectedUsers.forEach(user => {
		$("#connectedLobby").append("<li>" + user + "</li>");
	});
});

chat.on("userDisconnect", function(e) {
	addMessage(serverUser, (e.user.username + " has disconnected"));
	$("#connectedLobby").text("");
	e.connectedUsers.forEach(user => {
		$("#connectedLobby").append("<li>" + user + "</li>");
	});
});

var timeout;

chat.on("typing", function(user) {
	let li = $("#connectedLobby").children().filter(function() {
		return $(this).text() === user.username;
	});
	if (li.hasClass("typing")) {
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			li.removeClass("typing");
		}, 1000);
	} else {
		li.addClass("typing");
		timeout = setTimeout(function() {
			li.removeClass("typing");
		}, 1000);
	}
});

function addMessage(user, message) {
	let li = document.createElement("li");

	li.innerHTML = message;

	li.setAttribute("username", user.username);
	li.setAttribute("isadmin", user.isAdmin);

	messages.appendChild(li);
	chatconsole.scrollTo(0, chatconsole.scrollHeight);
}