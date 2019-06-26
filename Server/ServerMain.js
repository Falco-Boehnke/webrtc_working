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
    }
    ServerMain.SendAllValidIceCandidatesToPeer = function (_messageData) {
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        var clientToShareCandidatesWith = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);
        if (clientToShareCandidatesWith != null) {
            var candidateToSend = new NetworkCommunication.MessageCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
            ServerMain.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    };
    ServerMain.users = {};
    ServerMain.usersCollection = new Array();
    // TODO PArameter mit Unterstrich
    // TODO Coding guidelines umsetzen
    // handle closing
    ServerMain.serverEventHandler = function () {
        ServerMain.websocketServer.on("connection", function (_websocketClient) {
            // _websocketClient = _websocketClient;
            console.log("User connected FRESH");
            var uniqueIdOnConnection = ServerMain.createID();
            var freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
            ServerMain.usersCollection.push(freshlyConnectedClient);
            _websocketClient.on("message", ServerMain.serverHandleMessageType);
            _websocketClient.addEventListener("close", function () {
                console.error("Error at connection");
            });
        });
    };
    // TODO Check if event.type can be used for identification instead
    ServerMain.serverHandleMessageType = function (_message) {
        var parsedMessage = null;
        if (_message) {
            var test = _message.target;
            console.log("MEssage: ", _message);
            console.log("Target: ", test);
        }
        console.log(_message);
        try {
            parsedMessage = JSON.parse(_message.data);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        var messageData = parsedMessage;
        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                // TODO Fehler liegt in messageData.target, muss client rausfinden ohne das
                case EnumeratorCollection_1.MESSAGE_TYPE.LOGIN:
                    ServerMain.AddUserIfLoginRequestIsValid(messageData.target, messageData);
                    break;
                case EnumeratorCollection_1.MESSAGE_TYPE.RTC_OFFER:
                    ServerMain.SendRTCOfferToSpecifiedUser(messageData);
                    break;
                case EnumeratorCollection_1.MESSAGE_TYPE.RTC_ANSWER:
                    ServerMain.SendRTCAnswerToOfferingUser(messageData);
                    break;
                case EnumeratorCollection_1.MESSAGE_TYPE.RTC_CANDIDATE:
                    ServerMain.SendAllValidIceCandidatesToPeer(messageData);
                    break;
                default:
                    console.log("Message type not recognized");
                    break;
            }
        }
    };
    ServerMain.AddUserIfLoginRequestIsValid = function (_websocketConnection, _messageData) {
        console.log("User logged", _messageData.loginUserName);
        var usernameTaken = ServerMain.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", ServerMain.usersCollection);
        if (!usernameTaken) {
            ServerMain.sendTo(_websocketConnection, { type: "login", success: false });
            console.log("UsernameTaken");
            // const associatedWebsocketConnectionClient =
            // ServerMain.searchForPropertyValueInCollection
            //         (_websocketConnection,
            //             "clientConnection",
            //             ServerMain.usersCollection);
            //             console.log(associatedWebsocketConnectionClient);
            // if (associatedWebsocketConnectionClient) {
            // }
        }
        else {
            usernameTaken.userName = _messageData.loginUserName;
            console.log("Changed name of client object");
            ServerMain.sendTo(_websocketConnection, {
                type: "login",
                success: true,
                id: usernameTaken.id
            });
        }
    };
    ServerMain.SendRTCOfferToSpecifiedUser = function (_messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        var requestedClient = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);
        if (requestedClient != null) {
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            var offerMessage = new NetworkCommunication.MessageOffer(requestedClient.userName, _messageData.offer);
            ServerMain.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.log("Usernoame to connect to doesn't exist");
        }
    };
    ServerMain.SendRTCAnswerToOfferingUser = function (_messageData) {
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);
        var clientToSendAnswerTo = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);
        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            var answerToSend = new NetworkCommunication.MessageAnswer(clientToSendAnswerTo.userName, _messageData.answer);
            ServerMain.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    };
    //#region Helperfunctions
    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    ServerMain.searchForPropertyValueInCollection = function (propertyValue, key, collectionToSearch) {
        for (var propertyObject in collectionToSearch) {
            console.log("SearchLoop", propertyObject);
            if (ServerMain.usersCollection.hasOwnProperty(propertyObject)) {
                console.log("Has own property");
                var objectToSearchThrough = collectionToSearch[propertyObject];
                console.log("Object thatis searched for property: ", objectToSearchThrough);
                if (objectToSearchThrough[key] === propertyValue) {
                    console.log("The object has been found", objectToSearchThrough[key]);
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    };
    ServerMain.createID = function () {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    };
    //#endregion
    ServerMain.parseMessageToJson = function (_messageToParse) {
        var parsedMessage = { messageType: EnumeratorCollection_1.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_messageToParse);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    };
    ServerMain.sendTo = function (_connection, _message) {
        _connection.send(JSON.stringify(_message));
    };
    ServerMain.initializeServer = function () {
        ServerMain.websocketServer = new WebSocket.Server({ port: 8080 });
        ServerMain.serverEventHandler();
    };
    return ServerMain;
}());
var defaultServer = ServerMain.initializeServer();
