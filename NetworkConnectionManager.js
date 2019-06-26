"use strict";
exports.__esModule = true;
var NetCommunication = require("./NetworkMessages/index");
var UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
var NetworkConnectionManager = /** @class */ (function () {
    function NetworkConnectionManager() {
        var _this = this;
        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        //     var configuration = { iceServers: [{
        //         urls: "stun:stun.services.mozilla.com",
        //         username: "louis@mozilla.com",
        //         credential: "webrtcdemo"
        //     }, {
        //         urls: ["stun:stun.example.com", "stun:stun-1.example.com"]
        //     }]
        // };
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" },
            ]
        };
        this.addUiListeners = function () {
            UiElementHandler_1.UiElementHandler.getAllUiElements();
            console.log(UiElementHandler_1.UiElementHandler.loginButton);
            UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", _this.loginLogic);
            UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", _this.connectToUser);
            UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", _this.sendMessageToUser);
        };
        this.addWsEventListeners = function () {
            _this.ws.addEventListener("open", function () {
                console.log("Connected to the signaling server");
            });
            _this.ws.addEventListener("error", function (err) {
                console.error(err);
            });
            _this.ws.addEventListener("message", function (msg) {
                console.log("Got message", msg.data);
                var data = JSON.parse(msg.data);
                switch (data.type) {
                    case "login":
                        _this.handleLogin(data.success);
                        break;
                    case "offer":
                        _this.handleOffer(data.offer, data.username);
                        break;
                    case "answer":
                        _this.handleAnswer(data.answer);
                        break;
                    case "candidate":
                        _this.handleCandidate(data.candidate);
                        break;
                }
            });
        };
        this.handleCandidate = function (_candidate) {
            _this.connection.addIceCandidate(new RTCIceCandidate(_candidate));
        };
        this.handleAnswer = function (_answer) {
            _this.connection.setRemoteDescription(new RTCSessionDescription(_answer));
        };
        this.handleOffer = function (_offer, _username) {
            _this.otherUsername = _username;
            _this.connection.setRemoteDescription(new RTCSessionDescription(_offer));
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            _this.connection.createAnswer()
                .then(function (answer) {
                return _this.connection.setLocalDescription(answer);
            }).then(function () {
                var answerMessage = new NetCommunication.MessageAnswer(_this.otherUsername, _this.connection.localDescription);
                _this.sendMessage(answerMessage);
            })["catch"](function () {
                console.error("Answer creation failed.");
            });
            // this.connection.createAnswer(undefined);
            // this.connection.createAnswer(
            //     (answer: RTCSessionDescriptionInit) => {
            //         this.connection.setLocalDescription(answer);
            //         const answerMessage = new MessageAnswer(this.otherUsername, answer);
            //         this.sendMessage(answerMessage);
            //     },
            // ).then () => {
            //     alert("Error when creating an answer");
            //     console.error(error);
            // };
        };
        this.handleLogin = function (_loginSuccess) {
            console.log(_loginSuccess);
            if (_loginSuccess) {
                console.log("Login succesfully done");
                _this.createRTCConnection();
                console.log("COnnection at Login: ", _this.connection);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        this.loginLogic = function () {
            if (UiElementHandler_1.UiElementHandler.loginNameInput != null) {
                _this.username = UiElementHandler_1.UiElementHandler.loginNameInput.value;
            }
            else {
                console.error("UI element missing: Loginname Input field");
            }
            console.log(_this.username);
            if (_this.username.length <= 0) {
                console.log("Please enter username");
                return;
            }
            var loginMessage = new NetCommunication.MessageLoginRequest(_this.username);
            console.log(loginMessage);
            _this.sendMessage(loginMessage);
        };
        this.createRTCConnection = function () {
            _this.connection = new RTCPeerConnection(_this.configuration);
            _this.peerConnection = _this.connection.createDataChannel("testChannel");
            _this.connection.ondatachannel = function (datachannelEvent) {
                console.log("Data channel is created!");
                datachannelEvent.channel.addEventListener("open", function () {
                    console.log("Data channel is open and ready to be used.");
                });
                datachannelEvent.channel.addEventListener("message", function (messageEvent) {
                    console.log("Received message: " + messageEvent.data);
                    UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + _this.otherUsername + ": " + messageEvent.data;
                });
            };
            _this.peerConnection.onmessage = function (event) {
                console.log("Received message from other peer:", event.data);
                UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "<br>" + event.data;
            };
            _this.connection.onicecandidate = function (event) {
                if (event.candidate) {
                    var candidateMessage = new NetCommunication.MessageCandidate(_this.otherUsername, event.candidate);
                    _this.sendMessage(candidateMessage);
                }
            };
        };
        this.connectToUser = function () {
            // const callUsernameElement =  document.querySelector("input#username-to-call") as HTMLInputElement;
            // const callToUsername = callUsernameElement.value;
            var callToUsername = UiElementHandler_1.UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                alert("Enter a username 😉");
                return;
            }
            _this.otherUsername = callToUsername;
            _this.createRtcOffer(_this.otherUsername);
        };
        this.createRtcOffer = function (_userNameForOffer) {
            _this.connection.createOffer().then(function (offer) {
                return _this.connection.setLocalDescription(offer);
            }).then(function () {
                var offerMessage = new NetCommunication.MessageOffer(_userNameForOffer, _this.connection.localDescription);
                _this.sendMessage(offerMessage);
            })["catch"](function () {
                console.error("Offer creation error");
            });
            // this.connection.createOffer(
            //     (offer: RTCSessionDescriptionInit) => {
            //         const offerMessage = new MessageOffer(userNameForOffer, offer);
            //         this.connection.setLocalDescription(offer);
            //         this.sendMessage(offerMessage);
            //     },
            //     (error) => {
            //         alert("Error when creating an offer");
            //         console.error(error);
            //     },
            // );
        };
        this.sendMessage = function (message) {
            _this.ws.send(JSON.stringify(message));
        };
        this.sendMessageToUser = function () {
            // const messageField =  document.getElementById("msgInput") as HTMLInputElement;
            // const message = messageField.value;
            var message = UiElementHandler_1.UiElementHandler.msgInput.value;
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + _this.username + ": " + message;
            _this.peerConnection.send(message);
        };
        this.ws = new WebSocket("ws://localhost:8080");
        this.username = "";
        this.connection = new RTCPeerConnection();
        this.otherUsername = "";
        this.peerConnection = undefined;
        UiElementHandler_1.UiElementHandler.getAllUiElements();
        this.addUiListeners();
        this.addWsEventListeners();
    }
    return NetworkConnectionManager;
}());
exports.NetworkConnectionManager = NetworkConnectionManager;
