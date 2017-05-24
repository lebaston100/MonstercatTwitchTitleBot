window.addEventListener("load", init, false);

var oAuthToken = "<token here>"; //Paste your Twitch oAuth Token here
var twitchUserName = "<username here>"; //Paste your Twitch username here
var curTitleText = "Current music title:"; //The text before the song title

var socketisOpen = 0;
var intervalID = 0;

function init() {
	doConnect();
	initAnimation();
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
	console.log(data);
	if (data.includes("display-name=Monstercat") && data.includes("@badges=broadcaster") && data.includes("Now Playing:") && !data.includes("http://monster.cat/Music-License")) {
		gottext = data.substring(data.indexOf("PRIVMSG #monstercat :") + "PRIVMSG #monstercat :".length);
		gottext = gottext.substring(gottext.indexOf("Now Playing: ") + "Now Playing: ".length);
		gottext2 = gottext.substring(0, gottext.indexOf(" - Listen "));
		if (gottext2.length > 2) {
			gottext = gottext.substring(0, gottext.indexOf(" - Listen "));
		}
		changeElement("text", curTitleText + " " + gottext.replace("\r", "").replace("\n", ""));
		playAnimation();
	} else if (data.includes("PING :tmi.twitch.tv")) {
		sendCommand("PONG :tmi.twitch.tv\r\n");
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