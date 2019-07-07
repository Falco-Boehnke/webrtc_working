"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("ws"));
const NetworkMessages = __importStar(require("./../NetworkMessages"));
const TYPES = __importStar(require("./../DataCollectors/Enumerators/EnumeratorCollection"));
const Client_1 = require("./../DataCollectors/Client");
// import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
// import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
// import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
// import { MessageLoginRequest } from "../NetworkMessages/MessageLoginRequest";
// import { MessageOffer } from "../NetworkMessages/MessageOffer";
class ServerMain {
    static startUpServer() {
        ServerMain.websocketServer = new WebSocket.Server({ port: 8080 });
        ServerMain.serverEventHandler();
    }
    // TODO Check if event.type can be used for identification instead
    static serverHandleMessageType(_message, _websocketClient) {
        let parsedMessage = null;
        console.log(_message);
        try {
            parsedMessage = JSON.parse(_message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        const messageData = parsedMessage;
        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                // TODO Enums ALLCAPS_ENUM
                // TODO messageData.target doesn't work, gotta replace that to find client connection, probably use ID
                case TYPES.MESSAGE_TYPE.LOGIN_REQUEST:
                    ServerMain.addUserOnValidLoginRequest(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    ServerMain.sendRtcOfferToRequestedClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    ServerMain.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_CANDIDATE:
                    ServerMain.sendIceCandidatesToRelevantPeers(_websocketClient, messageData);
                    break;
                default:
                    console.log("Message type not recognized");
                    break;
            }
        }
    }
    //#region MessageHandler
    static addUserOnValidLoginRequest(_websocketConnection, _messageData) {
        console.log("User logged", _messageData.loginUserName);
        let usernameTaken = true;
        usernameTaken = ServerMain.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", ServerMain.usersCollection) != null;
        if (!usernameTaken) {
            console.log("Username not taken");
            const associatedWebsocketConnectionClient = ServerMain.searchForPropertyValueInCollection(_websocketConnection, "clientConnection", ServerMain.usersCollection);
            if (associatedWebsocketConnectionClient != null) {
                associatedWebsocketConnectionClient.userName = _messageData.loginUserName;
                console.log("Changed name of client object");
                ServerMain.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, associatedWebsocketConnectionClient.id));
            }
        }
        else {
            ServerMain.sendTo(_websocketConnection, { type: "login", success: false });
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }
    static sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);
        if (requestedClient != null) {
            console.log("User for offer found", requestedClient);
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            const offerMessage = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            ServerMain.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.log("Usernoame to connect to doesn't exist");
        }
    }
    static answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);
        const clientToSendAnswerTo = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);
        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            const answerToSend = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            ServerMain.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    }
    static sendIceCandidatesToRelevantPeers(_websocketClient, _messageData) {
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        const clientToShareCandidatesWith = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);
        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.userName, _messageData.candidate);
            ServerMain.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }
    //#endregion
    //#region Helperfunctions
    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    static searchForPropertyValueInCollection(propertyValue, key, collectionToSearch) {
        for (const propertyObject in collectionToSearch) {
            if (ServerMain.usersCollection.hasOwnProperty(propertyObject)) {
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }
    static searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.usersCollection);
    }
    //#endregion
    static parseMessageToJson(_messageToParse) {
        let parsedMessage = { originatorId: " ", messageType: TYPES.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_messageToParse);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }
    static sendTo(_connection, _message) {
        _connection.send(JSON.stringify(_message));
    }
}
ServerMain.users = {};
ServerMain.usersCollection = new Array();
// TODO PArameter mit Unterstrich
// TODO Coding guidelines umsetzen
// handle closing
ServerMain.serverEventHandler = () => {
    ServerMain.websocketServer.on("connection", (_websocketClient) => {
        // _websocketClient = _websocketClient;
        console.log("User connected FRESH");
        const uniqueIdOnConnection = ServerMain.createID();
        const freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
        ServerMain.usersCollection.push(freshlyConnectedClient);
        _websocketClient.on("message", (_message) => {
            ServerMain.serverHandleMessageType(_message, _websocketClient);
        });
        _websocketClient.addEventListener("close", () => {
            console.error("Error at connection");
        });
    });
};
ServerMain.createID = () => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
};
const defaultServer = ServerMain.startUpServer();
