window.addEventListener("load", init, false);

var oAuthToken = "<token here>"; //Paste your Twitch oAuth Token here
var twitchUserName = "<username here>"; //Paste your Twitch username here

var socketisOpen = 0;
var intervalID = 0;
var oldSong = "";

function init() {
	doConnect();
	setInterval(doPing, 60000);
	initAnimation()
}

function sendCommand(p1) {
	if (socketisOpen) {
		websocket.send(p1);
		console.log("Sent: " + p1)
	} else {
		console.log('Fail: Not connected\n');
	}
}

function event(data) {
	if (data.includes("display-name=Monstercat") && data.includes("@badges=broadcaster") && data.includes("Now Playing:") && !data.includes("http://monster.cat/Music-License")) {
		gottext = data.substring(data.indexOf("PRIVMSG #monstercat :") + "PRIVMSG #monstercat :".length);
		gottext = gottext.substring(gottext.indexOf("Now Playing: ") + "Now Playing: ".length);
		if (gottext.indexOf(" - Listen") > 0) {
			gottext = gottext.substring(0, gottext.indexOf(" - Listen"));
		}
		if (gottext != oldSong) {
			changeElement("text", "Aktueller Titel: " + gottext);
			testAnimation();
			oldSong = gottext;
		}
	}
}

function changeElement(id, newContent) {
	document.getElementById(id).innerHTML = newContent
}

function doConnect() {
	websocket = new WebSocket("wss://irc-ws.chat.twitch.tv");
	websocket.onopen = function(evt) {
		onOpen(evt)
	};
	websocket.onclose = function(evt) {
		onClose(evt)
	};
	websocket.onmessage = function(evt) {
		onMessage(evt)
	};
	websocket.onerror = function(evt) {
		onError(evt)
	};
}

function onClose(evt) {
	socketisOpen = 0;
	if (!intervalID) {
		intervalID = setInterval(doConnect, 5000);
	}
}

function onOpen(evt) {
	socketisOpen = 1;
	clearInterval(intervalID);
	intervalID = 0;
	sendCommand("CAP REQ :twitch.tv/tags twitch.tv/commands");
	sendCommand("PASS " + oAuthToken);
	sendCommand("NICK " + twitchUserName);
	sendCommand("JOIN #monstercat");
}

function onMessage(evt) {
	event(evt.data);
}

function onError(evt) {
	socketisOpen = 0;
	if (!intervalID) {
		intervalID = setInterval(doConnect, 5000);
	}
}

function doDisconnect() {
	socketisOpen = 0;
	websocket.close();
}

function doPing() {
	sendCommand("PING");
}