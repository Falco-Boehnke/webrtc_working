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
            // UiElementHandler.getAllUiElements();
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
            console.log("Creating RTC Connection");
            this.connection = new RTCPeerConnection(this.configuration);
            this.connection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
            this.connection.addEventListener("datachannel", this.receiveDataChannel);
            console.log("CreateRTCConection State, Expected 'stable', got:  ", this.connection.signalingState);
        };
        //#endregion
        this.parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            console.log("Received message:", objectifiedMessage);
            switch (objectifiedMessage.messageType) {
                case TYPES.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("ID received, assigning to self");
                    this.localId = objectifiedMessage.assignedId;
                    break;
                case TYPES.MESSAGE_TYPE.LOGIN_RESPONSE:
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    console.log("Received offer, current signaling state: ", this.connection.signalingState);
                    this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    console.log("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.handleCandidate(objectifiedMessage.candidate);
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
            const loginMessage = new NetworkMessages.LoginRequest(this.localId, this.localUserName);
            this.sendMessage(loginMessage);
        };
        this.checkUsernameToConnectToAndInitiateConnection = () => {
            const callToUsername = UiElementHandler_1.UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                alert("Enter a username 😉");
                return;
            }
            // TODO Fehler ist das sich der answerer selbst die message schickt weil der
            // Username zu dem es connected ist nicht richtig gepeichert wird
            // Muss umwandeln zu IDs
            this.remoteClientId = callToUsername;
            console.log("Username to connect to: " + this.remoteClientId);
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.remoteClientId);
        };
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer) => {
            console.log("Creating Datachannel for connection and then creating offer");
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
            let message = new NetworkMessages.IceCandidate("", "", candidate);
            this.sendMessage(message);
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
            console.log("Setting description as answer");
            let descriptionAnswer = new RTCSessionDescription(_answer);
            console.log("Receiving Answer, setting remote desc Expected 'have-local-offer'|'have-remote-offer, got:  ", this.connection.signalingState);
            //TODO DAS IST DIE FEHLERQUELLE
            this.connection.setRemoteDescription(descriptionAnswer);
            console.log("Description set as answer");
        };
        this.handleCandidate = (event) => {
            console.log("Handling Remote Candidate");
            console.log(event);
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
            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.remoteClientId + ": " + _messageEvent.data;
        };
        this.ws = new WebSocket("ws://localhost:8080");
        this.localUserName = "";
        this.localId = "undefined";
        this.remoteConnection = null;
        this.remoteClientId = "";
        this.receivedDataChannelFromRemote = undefined;
        this.createRTCPeerConnectionAndAddListeners();
        // UiElementHandler.getAllUiElements();
        this.addUiListeners();
        this.addWsEventListeners();
    }
}
exports.NetworkConnectionManager = NetworkConnectionManager;
