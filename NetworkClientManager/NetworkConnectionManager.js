"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("./../index"));
class NetworkConnectionManager {
    constructor() {
        this.signalingServerUrl = "ws://localhost:8080";
        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        // tslint:disable-next-line: typedef
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        // public startUpSignalingServerFile = (_serverFileUri: string): void => {
        //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
        //     let server_test = require("./Server/ServerMain");
        // }
        this.connectToSpecifiedSignalingServer = () => {
            try {
                this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerUrl);
                this.addWsEventListeners();
            }
            catch (error) {
                console.log("Websocket Generation gescheitert");
            }
        };
        this.sendMessage = (_message) => {
            let stringifiedObject = "";
            try {
                stringifiedObject = JSON.stringify(_message);
            }
            catch (error) {
                console.error("JSON Parse failed", error);
            }
            if (this.webSocketConnectionToSignalingServer.readyState == 1) {
                console.log("Message sennnnnnnnnnnnnnnnnnnnnnt");
                this.webSocketConnectionToSignalingServer.send(stringifiedObject);
            }
            else {
                console.error("Websocket Connection closed unexpectedly");
            }
        };
        this.sendMessageViaDirectPeerConnection = () => {
            let message = new FudgeNetwork.PeerMessageSimpleText(this.ownClientId, FudgeNetwork.UiElementHandler.msgInput.value);
            FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + this.ownUserName + ": " + message;
            let stringifiedMessage = JSON.stringify(message);
            if (this.isInitiator && this.ownPeerDataChannel) {
                this.ownPeerDataChannel.send(stringifiedMessage);
            }
            else if (!this.isInitiator && this.remoteEventPeerDataChannel) {
                console.log("Sending Message via received Datachannel");
                this.remoteEventPeerDataChannel.send(stringifiedMessage);
            }
            else {
                console.error("Peer Connection undefined, connection likely lost");
            }
        };
        this.checkChosenUsernameAndCreateLoginRequest = () => {
            if (FudgeNetwork.UiElementHandler.loginNameInput != null) {
                this.ownUserName = FudgeNetwork.UiElementHandler.loginNameInput.value;
            }
            else {
                console.error("UI element missing: Loginname Input field");
            }
            if (this.ownUserName.length <= 0) {
                console.log("Please enter username");
                return;
            }
            this.createLoginRequestAndSendToServer(this.ownUserName);
        };
        this.checkUsernameToConnectToAndInitiateConnection = () => {
            const callToUsername = FudgeNetwork.UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                console.error("Enter a username 😉");
                return;
            }
            this.remoteClientId = callToUsername;
            console.log("Username to connect to: " + this.remoteClientId);
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.remoteClientId);
        };
        this.addWsEventListeners = () => {
            this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen) => {
                console.log("Conneced to the signaling server", _connOpen);
            });
            this.webSocketConnectionToSignalingServer.addEventListener("error", (_err) => {
                console.error(_err);
            });
            this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage) => {
                this.parseMessageAndCallCorrespondingMessageHandler(_receivedMessage);
            });
        };
        this.createLoginRequestAndSendToServer = (_requestingUsername) => {
            const loginMessage = new FudgeNetwork.NetworkMessageLoginRequest(this.ownClientId, this.ownUserName);
            this.sendMessage(loginMessage);
        };
        this.parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            console.log("Received message:", objectifiedMessage);
            switch (objectifiedMessage.messageType) {
                case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("ID received, assigning to self");
                    this.assignIdAndSendConfirmation(objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE:
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                    // console.log("Received offer, current signaling state: ", this.connection.signalingState);
                    this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                    // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                    // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.handleCandidate(objectifiedMessage);
                    break;
            }
        };
        this.createRTCPeerConnectionAndAddListeners = () => {
            console.log("Creating RTC Connection");
            this.ownPeerConnection = new RTCPeerConnection(this.configuration);
            this.ownPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
        };
        this.assignIdAndSendConfirmation = (_message) => {
            this.ownClientId = _message.assignedId;
            this.sendMessage(new FudgeNetwork.NetworkMessageIdAssigned(this.ownClientId));
        };
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer) => {
            console.log("Creating Datachannel for connection and then creating offer");
            this.isInitiator = true;
            this.ownPeerDataChannel = this.ownPeerConnection.createDataChannel("localDataChannel");
            this.ownPeerDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
            this.ownPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            this.ownPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            this.ownPeerConnection.createOffer()
                .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                return offer;
            })
                .then(async (offer) => {
                await this.ownPeerConnection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            })
                .then(() => {
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
                .catch(() => {
                console.error("Offer creation error");
            });
        };
        this.createOfferMessageAndSendToRemote = (_userNameForOffer) => {
            const offerMessage = new FudgeNetwork.NetworkMessageRtcOffer(this.ownClientId, _userNameForOffer, this.ownPeerConnection.localDescription);
            this.sendMessage(offerMessage);
            console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
        };
        this.createAnswerAndSendToRemote = (_remoteIdToAnswerTo) => {
            let ultimateAnswer;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.ownPeerConnection.createAnswer()
                .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.ownPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                const answerMessage = new FudgeNetwork.NetworkMessageRtcAnswer(this.ownClientId, _remoteIdToAnswerTo, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessage(answerMessage);
            })
                .catch(() => {
                console.error("Answer creation failed.");
            });
        };
        // tslint:disable-next-line: no-any
        this.sendNewIceCandidatesToPeer = ({ candidate }) => {
            console.log("Sending ICECandidates from: ", this.ownClientId);
            let message = new FudgeNetwork.NetworkMessageIceCandidate(this.ownClientId, this.remoteClientId, candidate);
            this.sendMessage(message);
        };
        this.loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
            if (_loginSuccess) {
                this.ownUserName = _originatorUserName;
                console.log("Local Username: " + this.ownUserName);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
        // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
        this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage) => {
            console.log("Setting description on offer and sending answer to username: ", _offerMessage.userNameToConnectTo);
            this.ownPeerConnection.addEventListener("datachannel", this.receiveDataChannel);
            this.remoteClientId = _offerMessage.originatorId;
            console.log("UserID to send answer to ", this.remoteClientId);
            let offerToSet = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            this.ownPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                await this.createAnswerAndSendToRemote(_offerMessage.originatorId);
            })
                .catch(this.handleCreateAnswerError);
            console.log("End of Function Receive offer, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
        };
        this.receiveAnswerAndSetRemoteDescription = (_localhostId, _answer) => {
            // console.log("Setting description as answer");
            let descriptionAnswer = new RTCSessionDescription(_answer);
            // console.log("Receiving Answer, setting remote desc Expected 'have-local-offer'|'have-remote-offer, got:  ", this.connection.signalingState);
            this.ownPeerConnection.setRemoteDescription(descriptionAnswer);
            // console.log("Remote Description set");
            // console.log("Signaling state:", this.connection.signalingState);
        };
        this.handleCandidate = async (_receivedIceMessage) => {
            if (_receivedIceMessage.candidate) {
                // console.log("ASyncly adding candidates");
                await this.ownPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
            }
        };
        this.receiveDataChannel = (event) => {
            console.log("Receice Datachannel event");
            this.remoteEventPeerDataChannel = event.channel;
            if (this.remoteEventPeerDataChannel) {
                this.remoteEventPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
                this.remoteEventPeerDataChannel.addEventListener("open", this.enableKeyboardPressesForSending);
                this.remoteEventPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            }
        };
        this.handleCreateAnswerError = (err) => {
            console.error(err);
        };
        this.enableKeyboardPressesForSending = () => {
            let browser = FudgeNetwork.UiElementHandler.electronWindow;
            browser.addEventListener("keydown", (event) => {
                if (event.keyCode == 27) {
                    this.sendDisconnectRequest();
                }
                else {
                    this.sendKeyPress(event.keyCode);
                }
            });
        };
        this.sendDisconnectRequest = () => {
            let dcRequest = new FudgeNetwork.PeerMessageDisconnectClient(this.ownClientId);
            this.sendPeerMessageToServer(dcRequest);
        };
        this.sendKeyPress = (_keyCode) => {
            if (this.remoteEventPeerDataChannel != undefined) {
                let keyPressMessage = new FudgeNetwork.PeerMessageKeysInput(this.ownClientId, _keyCode);
                this.sendPeerMessageToServer(keyPressMessage);
            }
        };
        this.sendPeerMessageToServer = (_messageToSend) => {
            try {
                let stringifiedMessage = JSON.stringify(_messageToSend);
                if (this.remoteEventPeerDataChannel) {
                    this.remoteEventPeerDataChannel.send(stringifiedMessage);
                }
            }
            catch (error) {
                console.error("Error occured when stringifying PeerMessage");
                console.error(error);
            }
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
            // TODO Fix it so that both clients have names instead of IDs for usage
            FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + this.remoteClientId + ": " + _messageEvent.data;
        };
        this.ownUserName = "";
        this.ownClientId = "undefined";
        this.remoteClientId = "";
        this.isInitiator = false;
        this.remoteEventPeerDataChannel = undefined;
        this.createRTCPeerConnectionAndAddListeners();
    }
}
exports.NetworkConnectionManager = NetworkConnectionManager;
