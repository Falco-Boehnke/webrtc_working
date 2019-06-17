"use strict";
exports.__esModule = true;
var WebSocket = require("ws");
var Client_1 = require("./../DataCollectors/Client");
var NetworkCommunication = require("./../NetworkMessages/index");
var EnumeratorCollection_1 = require("./../DataCollectors/Enumerators/EnumeratorCollection");
// import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
// import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
// import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
// import { MessageLoginRequest } from "../NetworkMessages/MessageLoginRequest";
// import { MessageOffer } from "../NetworkMessages/MessageOffer";
var ServerMain = /** @class */ (function () {
    function ServerMain() {
        var _this = this;
        this.users = {};
        this.usersCollection = new Array();
        // TODO PArameter mit Unterstrich
        // TODO Coding guidelines umsetzen
        // handle closing
        this.serverEventHandler = function () {
            _this.websocketServer.on("connection", function (_websocketClient) {
                // _websocketClient = _websocketClient;
                console.log("User connected FRESH");
                var uniqueIdOnConnection = _this.createID();
                var freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
                _this.usersCollection.push(freshlyConnectedClient);
                console.log("User connected FRESH");
                _websocketClient.on("message", _this.serverHandleMessageType);
                _websocketClient.addEventListener("close", function () {
                    console.error("Error at connection");
                });
            });
        };
        this.createID = function () {
            // Math.random should be random enough because of it's seed
            // convert to base 36 and pick the first few digits after comma
            return "_" + Math.random().toString(36).substr(2, 7);
        };
        this.websocketServer = new WebSocket.Server({ port: 8080 });
        this.serverEventHandler();
    }
    // TODO Check if event.type can be used for identification instead
    ServerMain.prototype.serverHandleMessageType = function (_message) {
        var parsedMessage = null;
        console.log(_message);
        try {
            parsedMessage = JSON.parse(_message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        var messageData = parsedMessage;
        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                // TODO Enums ALLCAPS_ENUM
                case EnumeratorCollection_1.MESSAGE_TYPE.LOGIN:
                    this.serverHandleLogin(messageData.target, messageData);
                    break;
                case EnumeratorCollection_1.MESSAGE_TYPE.RTC_OFFER:
                    this.serverHandleRTCOffer(messageData);
                    break;
                case EnumeratorCollection_1.MESSAGE_TYPE.RTC_ANSWER:
                    this.serverHandleRTCAnswer(messageData);
                    break;
                case EnumeratorCollection_1.MESSAGE_TYPE.RTC_CANDIDATE:
                    this.serverHandleICECandidate(messageData);
                    break;
                default:
                    console.log("Message type not recognized");
                    break;
            }
        }
    };
    //#region MessageHandler
    ServerMain.prototype.serverHandleLogin = function (_websocketConnection, _messageData) {
        console.log("User logged", _messageData.loginUserName);
        var usernameTaken = true;
        usernameTaken = this.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", this.usersCollection) != null;
        if (!usernameTaken) {
            var associatedWebsocketConnectionClient = this.searchForPropertyValueInCollection(_websocketConnection, "clientConnection", this.usersCollection);
            if (associatedWebsocketConnectionClient != null) {
                associatedWebsocketConnectionClient.userName = _messageData.loginUserName;
                console.log("Changed name of client object");
                this.sendTo(_websocketConnection, {
                    type: "login",
                    success: true,
                    id: associatedWebsocketConnectionClient.id
                });
            }
        }
        else {
            this.sendTo(_websocketConnection, { type: "login", success: false });
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    };
    ServerMain.prototype.serverHandleRTCOffer = function (_messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        var requestedClient = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);
        if (requestedClient != null) {
            console.log("User for offer found", requestedClient);
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            var offerMessage = new NetworkCommunication.MessageOffer(requestedClient.userName, _messageData.offer);
            this.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.log("Usernoame to connect to doesn't exist");
        }
    };
    ServerMain.prototype.serverHandleRTCAnswer = function (_messageData) {
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);
        var clientToSendAnswerTo = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);
        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            var answerToSend = new NetworkCommunication.MessageAnswer(clientToSendAnswerTo.userName, _messageData.answer);
            this.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    };
    ServerMain.prototype.serverHandleICECandidate = function (_messageData) {
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        var clientToShareCandidatesWith = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);
        if (clientToShareCandidatesWith != null) {
            var candidateToSend = new NetworkCommunication.MessageCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
            this.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    };
    //#endregion
    //#region Helperfunctions
    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    ServerMain.prototype.searchForPropertyValueInCollection = function (propertyValue, key, collectionToSearch) {
        for (var propertyObject in collectionToSearch) {
            if (this.usersCollection.hasOwnProperty(propertyObject)) {
                var objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    };
    //#endregion
    ServerMain.prototype.parseMessageToJson = function (_messageToParse) {
        var parsedMessage = { messageType: EnumeratorCollection_1.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_messageToParse);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    };
    ServerMain.prototype.sendTo = function (_connection, _message) {
        _connection.send(JSON.stringify(_message));
    };
    return ServerMain;
}());
var defaultServer = new ServerMain();
