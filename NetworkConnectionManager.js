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
    //#region Class initiation functions
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
            UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", this.checkChosenUsernameAndCreateLoginRequest);
            UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", this.checkUsernameToConnectToAndInitiateConnection);
            UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", this.sendMessageViaDirectPeerConnection);
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
        this.createRTCPeerConnectionAndAddListeners = () => {
            this.connection = new RTCPeerConnection(this.configuration);
            this.connection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
            this.connection.addEventListener("datachannel", this.receiveDataChannel);
        };
        //#endregion
        this.parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            switch (objectifiedMessage.messageType) {
                case TYPES.MESSAGE_TYPE.LOGIN_RESPONSE:
                    console.log("LOGIN SUCCESS", objectifiedMessage.loginSuccess);
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage.clientId, objectifiedMessage.offer, objectifiedMessage.userNameToConnectTo);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    this.handleCandidate(objectifiedMessage.clientId, objectifiedMessage.candidate);
                    break;
            }
        };
        //#region SendingFunctions
        this.checkChosenUsernameAndCreateLoginRequest = () => {
            if (UiElementHandler_1.UiElementHandler.loginNameInput != null) {
                this.localUserName = UiElementHandler_1.UiElementHandler.loginNameInput.value;
            }
            else {
                console.error("UI element missing: Loginname Input field");
            }
            if (this.localUserName.length <= 0) {
                console.log("Please enter username");
                return;
            }
            this.createLoginRequestAndSendToServer(this.localUserName);
        };
        this.createLoginRequestAndSendToServer = (_requestingUsername) => {
            const loginMessage = new NetworkMessages.LoginRequest(this.localUserName);
            this.sendMessage(loginMessage);
        };
        this.checkUsernameToConnectToAndInitiateConnection = () => {
            const callToUsername = UiElementHandler_1.UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                alert("Enter a username 😉");
                return;
            }
            this.userNameLocalIsConnectedTo = callToUsername;
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.userNameLocalIsConnectedTo);
        };
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer) => {
            this.localDataChannel = this.connection.createDataChannel("localDataChannel");
            this.localDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
            this.localDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            this.localDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            this.connection.createOffer()
                .then(async (offer) => {
                await this.connection.setLocalDescription(offer);
            })
                .then(() => {
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
                .catch(() => {
                console.error("Offer creation error");
            });
        };
        this.createOfferMessageAndSendToRemote = (_userNameForOffer) => {
            const offerMessage = new NetworkMessages.RtcOffer(this.localClientId, _userNameForOffer, this.connection.localDescription);
            this.sendMessage(offerMessage);
        };
        this.createAnswerAndSendToRemote = () => {
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.connection.createAnswer()
                .then(async (answer) => {
                return await this.connection.setLocalDescription(answer);
            }).then(async () => {
                const answerMessage = new NetworkMessages.RtcAnswer(this.localClientId, this.userNameLocalIsConnectedTo, this.connection.localDescription);
                await this.sendMessage(answerMessage);
            })
                .catch(() => {
                console.error("Answer creation failed.");
            });
        };
        this.sendNewIceCandidatesToPeer = (event) => {
            if (event.candidate && this.connection.signalingState == "stable") {
                console.log("Sending Ice Candidate");
                const candidateMessage = new NetworkMessages.IceCandidate(this.localClientId, this.userNameLocalIsConnectedTo, event.candidate);
                this.sendMessage(candidateMessage);
            }
            else {
                console.log("All ice candidates sent");
            }
        };
        this.sendMessage = (message) => {
            this.ws.send(JSON.stringify(message));
        };
        this.sendMessageViaDirectPeerConnection = () => {
            const message = UiElementHandler_1.UiElementHandler.msgInput.value;
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.localUserName + ": " + message;
            if (this.receivedDataChannelFromRemote) {
                this.receivedDataChannelFromRemote.send(message);
            }
            else {
                console.error("Peer Connection undefined, connection likely lost");
            }
        };
        //#endregion
        //#region ReceivingFunctions
        this.loginValidAddUser = (_assignedId, _loginSuccess) => {
            if (_loginSuccess) {
                this.localClientId = _assignedId;
                console.log("COnnection at Login: " + this.localClientId + " ", this.connection);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
        // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
        this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_localhostId, _offer, _usernameToRespondTo) => {
            console.log("Setting description on offer and sending answer");
            this.userNameLocalIsConnectedTo = _usernameToRespondTo;
            this.connection.setRemoteDescription(new RTCSessionDescription(_offer))
                .then(async () => await this.createAnswerAndSendToRemote())
                .catch(this.handleCreateAnswerError);
        };
        this.receiveAnswerAndSetRemoteDescription = (_localhostId, _answer) => {
            console.log("Setting description as answer");
            let descriptionAnswer = new RTCSessionDescription(_answer);
            this.connection.setRemoteDescription(descriptionAnswer);
            console.log("Description set as answer");
        };
        this.handleCandidate = (_localhostId, _candidate) => {
            console.log("Ice candidate Received", _candidate);
            let candidate;
            if (!_candidate || this.connection.signalingState != "stable") {
                // this.connection.addIceCandidate({candidate: ""});
                return;
            }
            else if (this.connection.signalingState == "stable") {
                candidate = new RTCIceCandidate(_candidate);
                this.connection.addIceCandidate(candidate);
            }
        };
        this.receiveDataChannel = (event) => {
            this.receivedDataChannelFromRemote = event.channel;
            if (this.receivedDataChannelFromRemote) {
                this.receivedDataChannelFromRemote.addEventListener("message", this.dataChannelMessageHandler);
                this.receivedDataChannelFromRemote.addEventListener("open", this.dataChannelStatusChangeHandler);
                this.receivedDataChannelFromRemote.addEventListener("close", this.dataChannelStatusChangeHandler);
            }
        };
        //#endregion
        //#region HelperFunctions
        this.handleCreateAnswerError = (err) => {
            console.error(err);
        };
        this.dataChannelStatusChangeHandler = (event) => {
            //TODO Reconnection logic
            console.log("Channel Event happened", event);
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
        this.dataChannelMessageHandler = (_messageEvent) => {
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.userNameLocalIsConnectedTo + ": " + _messageEvent.data;
        };
        this.ws = new WebSocket("ws://localhost:8080");
        this.localUserName = "";
        this.localClientId = "undefined";
        this.remoteConnection = null;
        this.userNameLocalIsConnectedTo = "";
        this.receivedDataChannelFromRemote = undefined;
        this.createRTCPeerConnectionAndAddListeners();
        UiElementHandler_1.UiElementHandler.getAllUiElements();
        this.addUiListeners();
        this.addWsEventListeners();
    }
}
exports.NetworkConnectionManager = NetworkConnectionManager;
