$("#loginPrompt").on("shown.bs.modal", function() {
	$("#usernameLogin").trigger("focus");
});

if (localStorage.token) {
	verifyToken(localStorage.token, function(status) {
		if (status == "200") {
			window.location = "/whisper.html";
		}
	});
}


function verifyToken(token, callback) {
	let req = new XMLHttpRequest();
	req.open("GET", "/auth", true);
	req.setRequestHeader("Authorization", ("Bearer " + token));
	req.onreadystatechange = function() {
		callback(this.status);
	};
	console.log("req");
	req.send();
}


var usernameLogin = document.getElementById("usernameLogin");
var passwordLogin = document.getElementById("passwordLogin");
var submitLogin = document.getElementById("submitLogin");

var emailSignup = document.getElementById("emailSignup");
var usernameSignup = document.getElementById("usernameSignup");
var passwordSignup = document.getElementById("passwordSignup");
var submitSignup = document.getElementById("submitSignup");

usernameLogin.onkeydown = function(e) {
	if (e.key == "Enter") {
		postLogin();
	}
};
passwordLogin.onkeydown = function(e) {
	if (e.key == "Enter") {
		postLogin();
	}
};
submitLogin.onclick = function() {
	postLogin();
};

function postLogin() {
	$("#loginFail").hide();
	let req = new XMLHttpRequest();
	req.open("POST", "/auth", true);

	let credentials = btoa(usernameLogin.value + ":" + passwordLogin.value);

	req.setRequestHeader("Authorization", ("Basic " + credentials));
	req.onload = function() {
		if (req.status == 200) {
			localStorage.setItem("token", req.response);
			window.location = "/whisper.html";
		} else if (req.status == 401) {
			$("#loginFail").show();
		}
	};

	req.send();
}

submitSignup.addEventListener("click", () => {
	postSignup(usernameSignup.value, passwordSignup.value, emailSignup.value, (status, response) => {
		if (status != 201) {
			console.log(response);
		} else {
			localStorage.setItem("token", response);
			window.location = "/whisper.html";
		}
	});
});

function postSignup(username, password, email, callback) {
	let req = new XMLHttpRequest();
	req.open("POST", "/signup", true);

	req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	req.onreadystatechange = function() {
		callback(req.status, req.response);
	};

	let user = JSON.stringify({
		username: username,
		password: password,
		email: email
	});

	req.send(user);
}