"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
const TYPES = __importStar(require("./DataCollectors/Enumerators/EnumeratorCollection"));
const NetworkMessages = __importStar(require("./NetworkMessages"));
class NetworkConnectionManager {
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    //     var configuration = { iceServers: [{
    //         urls: "stun:stun.services.mozilla.com",
    //         username: "louis@mozilla.com",
    //         credential: "webrtcdemo"
    //     }, {
    //         urls: ["stun:stun.example.com", "stun:stun-1.example.com"]
    //     }]
    // };
    constructor() {
        // tslint:disable-next-line: typedef
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        this.isNegotiating = false;
        this.addUiListeners = () => {
            UiElementHandler_1.UiElementHandler.getAllUiElements();
            console.log(UiElementHandler_1.UiElementHandler.loginButton);
            UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", this.loginLogic);
            UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", this.connectToUser);
            UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", this.sendMessageToUser);
        };
        this.addWsEventListeners = () => {
            this.ws.addEventListener("open", (_connOpen) => {
                console.log("Conneced to the signaling server", _connOpen);
            });
            this.ws.addEventListener("error", (_err) => {
                console.error(_err);
            });
            this.ws.addEventListener("message", (_receivedMessage) => {
                this.parseMessageAndCallCorrespondingMessageHandler(_receivedMessage);
            });
        };
        this.parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            switch (objectifiedMessage.messageType) {
                case TYPES.MESSAGE_TYPE.LOGIN_RESPONSE:
                    console.log("LOGIN SUCCESS", objectifiedMessage.loginSuccess);
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    this.setDescriptionOnOfferAndSendAnswer(objectifiedMessage.clientId, objectifiedMessage.offer, objectifiedMessage.userNameToConnectTo);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    this.setDescriptionAsAnswer(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    this.handleCandidate(objectifiedMessage.clientId, objectifiedMessage.candidate);
                    break;
            }
        };
        this.handleCandidate = (_localhostId, _candidate) => {
            console.log("Adding ice candidates");
            if (this.remoteConnection) {
                this.remoteConnection.addIceCandidate(new RTCIceCandidate(_candidate));
            }
        };
        this.setDescriptionAsAnswer = (_localhostId, _answer) => {
            console.log("Setting description as answer");
            console.log("Receiving answer before setting: ", this.localConnection.signalingState);
            debugger;
            if (this.remoteConnection) {
                this.remoteConnection.setRemoteDescription(new RTCSessionDescription(_answer));
            }
            console.log("Receiving answer after setting: ", this.localConnection.signalingState);
        };
        // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
        // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
        this.setDescriptionOnOfferAndSendAnswer = (_localhostId, _offer, _usernameToRespondTo) => {
            console.log("Setting description on offer and sending answer");
            this.userNameLocalIsConnectedTo = _usernameToRespondTo;
            this.remoteConnection = new RTCPeerConnection(this.configuration);
            const sessionDescription = new RTCSessionDescription(_offer);
            this.remoteConnection.setRemoteDescription(sessionDescription);
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.remoteConnection.createAnswer()
                .then((answer) => {
                console.log("Setting local description now.");
                if (this.remoteConnection) {
                    return this.remoteConnection.setLocalDescription(answer);
                }
            }).then(() => {
                if (this.remoteConnection) {
                    const answerMessage = new NetworkMessages.RtcAnswer(this.localClientId, this.userNameLocalIsConnectedTo, this.remoteConnection.localDescription);
                    this.sendMessage(answerMessage);
                    console.log("Create answer second: ", this.localConnection.signalingState);
                    console.log("Created answer message and sent: ", answerMessage);
                }
            })
                .catch(() => {
                console.error("Answer creation failed.");
            });
            // this.localConnection.createAnswer(undefined);
            // this.localConnection.createAnswer(
            //     (answer: RTCSessionDescriptionInit) => {
            //         this.localConnection.setLocalDescription(answer);
            //         const answerMessage = new MessageAnswer(this.otherUsername, answer);
            //         this.sendMessage(answerMessage);
            //     },
            // ).then () => {
            //     alert("Error when creating an answer");
            //     console.error(error);
            // };
        };
        this.loginValidAddUser = (_assignedId, _loginSuccess) => {
            if (_loginSuccess) {
                this.localClientId = _assignedId;
                this.createRTCConnection();
                console.log("COnnection at Login: " + this.localClientId + " ", this.localConnection);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        this.loginLogic = () => {
            if (UiElementHandler_1.UiElementHandler.loginNameInput != null) {
                this.localUserName = UiElementHandler_1.UiElementHandler.loginNameInput.value;
            }
            else {
                console.error("UI element missing: Loginname Input field");
            }
            console.log(this.localUserName);
            if (this.localUserName.length <= 0) {
                console.log("Please enter username");
                return;
            }
            const loginMessage = new NetworkMessages.LoginRequest(this.localUserName);
            console.log(loginMessage);
            this.sendMessage(loginMessage);
        };
        this.createRTCConnection = () => {
            this.localConnection = new RTCPeerConnection(this.configuration);
            this.peerConnectionToChosenPeer = this.localConnection.createDataChannel("testChannel");
            this.localConnection.ondatachannel = (datachannelEvent) => {
                console.log("Data channel is created!");
                datachannelEvent.channel.addEventListener("open", () => {
                    console.log("Data channel is open and ready to be used.");
                });
                datachannelEvent.channel.addEventListener("message", (messageEvent) => {
                    console.log("Received message: " + messageEvent.data);
                    UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.userNameLocalIsConnectedTo + ": " + messageEvent.data;
                });
            };
            this.peerConnectionToChosenPeer.onmessage = (event) => {
                console.log("Received message from other peer:", event.data);
                UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "<br>" + event.data;
            };
            this.localConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidateMessage = new NetworkMessages.IceCandidate(this.localClientId, this.userNameLocalIsConnectedTo, event.candidate);
                    this.sendMessage(candidateMessage);
                }
            };
        };
        this.connectToUser = () => {
            // const callUsernameElement =  document.querySelector("input#username-to-call") as HTMLInputElement;
            // const callToUsername = callUsernameElement.value;
            const callToUsername = UiElementHandler_1.UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                alert("Enter a username 😉");
                return;
            }
            this.userNameLocalIsConnectedTo = callToUsername;
            this.createRtcOffer(this.userNameLocalIsConnectedTo);
        };
        this.createRtcOffer = (_userNameForOffer) => {
            this.localConnection.createOffer()
                .then((offer) => {
                return this.localConnection.setLocalDescription(offer);
            }).then(() => {
                const offerMessage = new NetworkMessages.RtcOffer(this.localClientId, _userNameForOffer, this.localConnection.localDescription);
                this.sendMessage(offerMessage);
            })
                .catch(() => {
                console.error("Offer creation error");
            });
            // this.localConnection.createOffer(
            //     (offer: RTCSessionDescriptionInit) => {
            //         const offerMessage = new MessageOffer(userNameForOffer, offer);
            //         this.localConnection.setLocalDescription(offer);
            //         this.sendMessage(offerMessage);
            //     },
            //     (error) => {
            //         alert("Error when creating an offer");
            //         console.error(error);
            //     },
            // );
        };
        this.sendMessage = (message) => {
            this.ws.send(JSON.stringify(message));
        };
        this.sendMessageToUser = () => {
            // const messageField =  document.getElementById("msgInput") as HTMLInputElement;
            // const message = messageField.value;
            const message = UiElementHandler_1.UiElementHandler.msgInput.value;
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.localUserName + ": " + message;
            if (this.peerConnectionToChosenPeer) {
                this.peerConnectionToChosenPeer.send(message);
            }
            else {
                console.error("Peer Connection undefined, localConnection likely lost");
            }
        };
        // tslint:disable-next-line: no-any
        this.parseReceivedMessageAndReturnObject = (_receivedMessage) => {
            console.log("Got message", _receivedMessage);
            // tslint:disable-next-line: no-any
            let objectifiedMessage;
            try {
                objectifiedMessage = JSON.parse(_receivedMessage.data);
            }
            catch (error) {
                console.error("Invalid JSON", error);
            }
            return objectifiedMessage;
        };
        this.ws = new WebSocket("ws://localhost:8080");
        this.localUserName = "";
        this.localClientId = "undefined";
        this.localConnection = new RTCPeerConnection(this.configuration);
        this.remoteConnection = null;
        this.userNameLocalIsConnectedTo = "";
        this.peerConnectionToChosenPeer = undefined;
        UiElementHandler_1.UiElementHandler.getAllUiElements();
        this.addUiListeners();
        this.addWsEventListeners();
    }
}
exports.NetworkConnectionManager = NetworkConnectionManager;
