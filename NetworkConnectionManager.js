"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
// import * as NetworkTypes from "./DataCollectors/Enumerators/EnumeratorCollection";
// import * as NetworkMessages from "./NetworkMessages";
class NetworkConnectionManager {
    constructor() {
        this.signalingServerUrl = "ws://localhost:8080";
        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        this.startUpSignalingServerFile = (_serverFileUri) => {
            // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
            let server_test = require("./Server/ServerMain");
        };
        this.connectToSpecifiedSignalingServer = () => {
            this.ws = new WebSocket(this.signalingServerUrl);
            this.addWsEventListeners();
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
        this.sendMessage = (message) => {
            this.ws.send(JSON.stringify(message));
        };
        this.sendMessageViaDirectPeerConnection = () => {
            const message = UiElementHandler_1.UiElementHandler.msgInput.value;
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.localUserName + ": " + message;
            if (this.isInitiator && this.localDataChannel) {
                this.localDataChannel.send(message);
            }
            else if (!this.isInitiator && this.receivedDataChannelFromRemote) {
                console.log("Sending Message via received Datachannel");
                this.receivedDataChannelFromRemote.send(message);
            }
            else {
                console.error("Peer Connection undefined, connection likely lost");
            }
        };
        this.createLoginRequestAndSendToServer = (_requestingUsername) => {
            const loginMessage = new NetworkMessages.LoginRequest(this.localId, this.localUserName);
            this.sendMessage(loginMessage);
        };
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
        this.checkUsernameToConnectToAndInitiateConnection = () => {
            const callToUsername = UiElementHandler_1.UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                console.error("Enter a username 😉");
                return;
            }
            // TODO Fehler ist das sich der answerer selbst die message schickt weil der
            // Username zu dem es connected ist nicht richtig gepeichert wird
            // Muss umwandeln zu IDs
            this.remoteClientId = callToUsername;
            console.log("Username to connect to: " + this.remoteClientId);
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.remoteClientId);
        };
        this.parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            console.log("Received message:", objectifiedMessage);
            switch (objectifiedMessage.messageType) {
                case NetworkTypes.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("ID received, assigning to self");
                    this.assignIdAndSendConfirmation(objectifiedMessage);
                    break;
                case NetworkTypes.MESSAGE_TYPE.LOGIN_RESPONSE:
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                    break;
                case NetworkTypes.MESSAGE_TYPE.RTC_OFFER:
                    // console.log("Received offer, current signaling state: ", this.connection.signalingState);
                    this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                    break;
                case NetworkTypes.MESSAGE_TYPE.RTC_ANSWER:
                    // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE:
                    // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.handleCandidate(objectifiedMessage);
                    break;
            }
        };
        this.createRTCPeerConnectionAndAddListeners = () => {
            console.log("Creating RTC Connection");
            this.connection = new RTCPeerConnection(this.configuration);
            this.connection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
        };
        this.assignIdAndSendConfirmation = (_message) => {
            this.localId = _message.assignedId;
            this.sendMessage(new NetworkMessages.IdAssigned(this.localId));
        };
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer) => {
            console.log("Creating Datachannel for connection and then creating offer");
            this.isInitiator = true;
            this.localDataChannel = this.connection.createDataChannel("localDataChannel");
            this.localDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
            this.localDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            this.localDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            this.connection.createOffer()
                .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.connection.signalingState);
                return offer;
            })
                .then(async (offer) => {
                await this.connection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.connection.signalingState);
            })
                .then(() => {
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
                .catch(() => {
                console.error("Offer creation error");
            });
        };
        this.createOfferMessageAndSendToRemote = (_userNameForOffer) => {
            const offerMessage = new NetworkMessages.RtcOffer(this.localId, _userNameForOffer, this.connection.localDescription);
            this.sendMessage(offerMessage);
            console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.connection.signalingState);
        };
        this.createAnswerAndSendToRemote = (_remoteIdToAnswerTo) => {
            let ultimateAnswer;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.connection.createAnswer()
                .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.connection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.connection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.connection.signalingState);
                const answerMessage = new NetworkMessages.RtcAnswer(this.localId, _remoteIdToAnswerTo, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessage(answerMessage);
            })
                .catch(() => {
                console.error("Answer creation failed.");
            });
        };
        this.sendNewIceCandidatesToPeer = ({ candidate }) => {
            console.log("Sending ICECandidates from: ", this.localId);
            let message = new NetworkMessages.IceCandidate(this.localId, this.remoteClientId, candidate);
            this.sendMessage(message);
        };
        this.loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
            if (_loginSuccess) {
                this.localUserName = _originatorUserName;
                console.log("Local Username: " + this.localUserName);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
        // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
        this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage) => {
            console.log("Setting description on offer and sending answer to username: ", _offerMessage.userNameToConnectTo);
            this.connection.addEventListener("datachannel", this.receiveDataChannel);
            this.remoteClientId = _offerMessage.originatorId;
            console.log("UserID to send answer to ", this.remoteClientId);
            let offerToSet = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            this.connection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.connection.signalingState);
                await this.createAnswerAndSendToRemote(_offerMessage.originatorId);
            })
                .catch(this.handleCreateAnswerError);
            console.log("End of Function Receive offer, Expected 'stable', got:  ", this.connection.signalingState);
        };
        this.receiveAnswerAndSetRemoteDescription = (_localhostId, _answer) => {
            // console.log("Setting description as answer");
            let descriptionAnswer = new RTCSessionDescription(_answer);
            // console.log("Receiving Answer, setting remote desc Expected 'have-local-offer'|'have-remote-offer, got:  ", this.connection.signalingState);
            this.connection.setRemoteDescription(descriptionAnswer);
            // console.log("Remote Description set");
            // console.log("Signaling state:", this.connection.signalingState);
        };
        this.handleCandidate = async (_receivedIceMessage) => {
            if (_receivedIceMessage.candidate) {
                // console.log("ASyncly adding candidates");
                await this.connection.addIceCandidate(_receivedIceMessage.candidate);
            }
        };
        this.receiveDataChannel = (event) => {
            console.log("Receice Datachannel event");
            this.receivedDataChannelFromRemote = event.channel;
            if (this.receivedDataChannelFromRemote) {
                this.receivedDataChannelFromRemote.addEventListener("message", this.dataChannelMessageHandler);
                this.receivedDataChannelFromRemote.addEventListener("open", this.dataChannelStatusChangeHandler);
                this.receivedDataChannelFromRemote.addEventListener("close", this.dataChannelStatusChangeHandler);
            }
        };
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
            // TODO Fix it so that both clients have names instead of IDs for usage
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.remoteClientId + ": " + _messageEvent.data;
        };
        this.localUserName = "";
        this.localId = "undefined";
        this.remoteConnection = null;
        this.remoteClientId = "";
        this.isInitiator = false;
        this.receivedDataChannelFromRemote = undefined;
        this.createRTCPeerConnectionAndAddListeners();
    }
}
exports.NetworkConnectionManager = NetworkConnectionManager;
