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
const NetworkMessages_1 = require("./../NetworkMessages");
class ServerMain {
    // TODO Check if event.type can be used for identification instead
    static serverHandleMessageType(_message, _websocketClient) {
        let parsedMessage = null;
        try {
            parsedMessage = JSON.parse(_message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        // tslint:disable-next-line: no-any
        const messageData = parsedMessage;
        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                case TYPES.MESSAGE_TYPE.ID_ASSIGNED:
                    console.error("Id assignment received as Server");
                    break;
                case TYPES.MESSAGE_TYPE.LOGIN_REQUEST:
                    ServerMain.addUserOnValidLoginRequest(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    ServerMain.sendRtcOfferToRequestedClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    ServerMain.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
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
        console.log("User logged: ", _messageData.loginUserName);
        let usernameTaken = true;
        usernameTaken = ServerMain.searchUserByUserNameAndReturnUser(_messageData.loginUserName, ServerMain.connectedClientsCollection) != null;
        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn = ServerMain.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, ServerMain.connectedClientsCollection);
            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                ServerMain.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        }
        else {
            ServerMain.sendTo(_websocketConnection, new NetworkMessages_1.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }
    static sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.connectedClientsCollection);
        if (requestedClient != null) {
            console.log("User for offer found", requestedClient);
            // requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            const offerMessage = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            ServerMain.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.error("Username to connect to doesn't exist");
        }
    }
    static answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo = ServerMain.searchUserByUserIdAndReturnUser(_messageData.targetId, ServerMain.connectedClientsCollection);
        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                ServerMain.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }
    static sendIceCandidatesToRelevantPeers(_websocketClient, _messageData) {
        console.log("Sending candidate to:", _messageData.targetId, "from: ", _messageData.originatorId);
        const clientToShareCandidatesWith = ServerMain.searchUserByUserIdAndReturnUser(_messageData.targetId, ServerMain.connectedClientsCollection);
        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            ServerMain.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }
    //#endregion
    //#region Helperfunctions
    static searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
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
}
ServerMain.connectedClientsCollection = new Array();
ServerMain.startUpServer = () => {
    ServerMain.websocketServer = new WebSocket.Server({ port: 8080 });
    ServerMain.serverEventHandler();
};
// TODO PArameter mit Unterstrich
// TODO Coding guidelines umsetzen
// handle closing
ServerMain.serverEventHandler = () => {
    ServerMain.websocketServer.on("connection", (_websocketClient) => {
        // _websocketClient = _websocketClient;
        console.log("User connected FRESH");
        const uniqueIdOnConnection = ServerMain.createID();
        ServerMain.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
        const freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
        ServerMain.connectedClientsCollection.push(freshlyConnectedClient);
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
ServerMain.sendTo = (_connection, _message) => {
    _connection.send(JSON.stringify(_message));
};
// Helper function for searching through a collection, finding objects by key and value, returning
// Object that has that value
// tslint:disable-next-line: no-any
ServerMain.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
    for (const propertyObject in collectionToSearch) {
        if (ServerMain.connectedClientsCollection.hasOwnProperty(propertyObject)) {
            // tslint:disable-next-line: typedef
            const objectToSearchThrough = collectionToSearch[propertyObject];
            if (objectToSearchThrough[key] === propertyValue) {
                return objectToSearchThrough;
            }
        }
    }
    return null;
};
ServerMain.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
    return ServerMain.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
};
ServerMain.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
    return ServerMain.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
};
ServerMain.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
    return ServerMain.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
};
ServerMain.startUpServer();
