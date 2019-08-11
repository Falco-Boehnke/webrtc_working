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
const NetworkMessages = __importStar(require("../NetworkMessages"));
const TYPES = __importStar(require("../DataCollectors/Enumerators/EnumeratorCollection"));
const Client_1 = require("../DataCollectors/Client");
class SignalingServer {
    // TODO Check if event.type can be used for identification instead => It cannot
    static serverHandleMessageType(_message, _websocketClient) {
        let parsedMessage = null;
        try {
            parsedMessage = JSON.parse(_message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        const messageData = parsedMessage;
        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                case TYPES.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("Id confirmation received for client: " + parsedMessage.originatorId);
                    break;
                case TYPES.MESSAGE_TYPE.LOGIN_REQUEST:
                    SignalingServer.addUserOnValidLoginRequest(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    SignalingServer.sendRtcOfferToRequestedClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    SignalingServer.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    SignalingServer.sendIceCandidatesToRelevantPeers(_websocketClient, messageData);
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
        usernameTaken = SignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, SignalingServer.connectedClientsCollection) != null;
        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn = SignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, SignalingServer.connectedClientsCollection);
            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                SignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        }
        else {
            SignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }
    static sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = SignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", SignalingServer.connectedClientsCollection);
        if (requestedClient != null) {
            const offerMessage = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            SignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.error("User to connect to doesn't exist under that Name");
        }
    }
    static answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo = SignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, SignalingServer.connectedClientsCollection);
        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                SignalingServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }
    static sendIceCandidatesToRelevantPeers(_websocketClient, _messageData) {
        const clientToShareCandidatesWith = SignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, SignalingServer.connectedClientsCollection);
        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            SignalingServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
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
SignalingServer.connectedClientsCollection = new Array();
SignalingServer.startUpServer = (_serverPort) => {
    console.log(_serverPort);
    if (!_serverPort) {
        SignalingServer.websocketServer = new WebSocket.Server({ port: 8080 });
    }
    else {
        SignalingServer.websocketServer = new WebSocket.Server({ port: _serverPort });
    }
    SignalingServer.serverEventHandler();
};
SignalingServer.serverEventHandler = () => {
    SignalingServer.websocketServer.on("connection", (_websocketClient) => {
        // _websocketClient = _websocketClient;
        console.log("User connected FRESH");
        const uniqueIdOnConnection = SignalingServer.createID();
        SignalingServer.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
        const freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
        SignalingServer.connectedClientsCollection.push(freshlyConnectedClient);
        _websocketClient.on("message", (_message) => {
            SignalingServer.serverHandleMessageType(_message, _websocketClient);
        });
        _websocketClient.addEventListener("close", () => {
            console.error("Error at connection");
            for (let i = 0; i < SignalingServer.connectedClientsCollection.length; i++) {
                if (SignalingServer.connectedClientsCollection[i].clientConnection === _websocketClient) {
                    console.log("Client found, deleting");
                    SignalingServer.connectedClientsCollection.splice(i, 1);
                    console.log(SignalingServer.connectedClientsCollection);
                }
                else {
                    console.log("Wrong client to delete, moving on");
                }
            }
        });
    });
};
SignalingServer.createID = () => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
};
// TODO Type Websocket not assignable to type WebSocket ?!
SignalingServer.sendTo = (_connection, _message) => {
    _connection.send(JSON.stringify(_message));
};
// Helper function for searching through a collection, finding objects by key and value, returning
// Object that has that value
// tslint:disable-next-line: no-any
SignalingServer.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
    for (const propertyObject in collectionToSearch) {
        if (SignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
            // tslint:disable-next-line: typedef
            const objectToSearchThrough = collectionToSearch[propertyObject];
            if (objectToSearchThrough[key] === propertyValue) {
                return objectToSearchThrough;
            }
        }
    }
    return null;
};
SignalingServer.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
    return SignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
};
SignalingServer.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
    return SignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
};
SignalingServer.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
    return SignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
};
exports.SignalingServer = SignalingServer;
// SignalingServer.startUpServer();
