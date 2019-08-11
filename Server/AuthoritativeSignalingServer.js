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
const AuthoritativeServerEntity_1 = require("./AuthoritativeServerEntity");
class AuthoritativeSignalingServer {
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
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    AuthoritativeSignalingServer.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    AuthoritativeSignalingServer.sendIceCandidatesToRelevantPeers(_websocketClient, messageData);
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
        usernameTaken = AuthoritativeSignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, AuthoritativeSignalingServer.connectedClientsCollection) != null;
        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn = AuthoritativeSignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, AuthoritativeSignalingServer.connectedClientsCollection);
            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                AuthoritativeSignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        }
        else {
            AuthoritativeSignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }
    static sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = AuthoritativeSignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", AuthoritativeSignalingServer.connectedClientsCollection);
        if (requestedClient != null) {
            const offerMessage = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            AuthoritativeSignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.error("User to connect to doesn't exist under that Name");
        }
    }
    static answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to AS-Entity");
        AuthoritativeSignalingServer.authoritativeServerEntity.receiveAnswerAndSetRemoteDescription(_websocketClient, _messageData);
    }
    static sendIceCandidatesToRelevantPeers(_websocketClient, _messageData) {
        const clientToShareCandidatesWith = AuthoritativeSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeSignalingServer.connectedClientsCollection);
        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            AuthoritativeSignalingServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
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
AuthoritativeSignalingServer.connectedClientsCollection = new Array();
AuthoritativeSignalingServer.startUpServer = (_serverPort) => {
    console.log(_serverPort);
    if (!_serverPort) {
        AuthoritativeSignalingServer.websocketServer = new WebSocket.Server({ port: 8080 });
    }
    else {
        AuthoritativeSignalingServer.websocketServer = new WebSocket.Server({ port: _serverPort });
    }
    AuthoritativeSignalingServer.authoritativeServerEntity = new AuthoritativeServerEntity_1.AuthoritativeServerEntity();
    AuthoritativeSignalingServer.serverEventHandler();
};
AuthoritativeSignalingServer.closeDownServer = () => {
    AuthoritativeSignalingServer.websocketServer.close();
};
AuthoritativeSignalingServer.serverEventHandler = () => {
    AuthoritativeSignalingServer.websocketServer.on("connection", (_websocketClient) => {
        console.log("User connected to autho-SignalingServer");
        const uniqueIdOnConnection = AuthoritativeSignalingServer.createID();
        const freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
        AuthoritativeSignalingServer.connectedClientsCollection.push(freshlyConnectedClient);
        AuthoritativeSignalingServer.authoritativeServerEntity.collectClientCreatePeerConnectionAndCreateOffer(freshlyConnectedClient);
        _websocketClient.on("message", (_message) => {
            AuthoritativeSignalingServer.serverHandleMessageType(_message, _websocketClient);
        });
        _websocketClient.addEventListener("close", () => {
            console.error("Error at connection");
            for (let i = 0; i < AuthoritativeSignalingServer.connectedClientsCollection.length; i++) {
                if (AuthoritativeSignalingServer.connectedClientsCollection[i].clientConnection === _websocketClient) {
                    console.log("Client found, deleting");
                    AuthoritativeSignalingServer.connectedClientsCollection.splice(i, 1);
                    console.log(AuthoritativeSignalingServer.connectedClientsCollection);
                }
                else {
                    console.log("Wrong client to delete, moving on");
                }
            }
        });
    });
};
AuthoritativeSignalingServer.createID = () => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
};
// TODO Type Websocket not assignable to type WebSocket ?!
AuthoritativeSignalingServer.sendTo = (_connection, _message) => {
    _connection.send(JSON.stringify(_message));
};
AuthoritativeSignalingServer.sendToId = (_clientId, _message) => {
    let client = AuthoritativeSignalingServer.searchForClientWithId(_clientId);
    if (client.clientConnection) {
        client.clientConnection.send(JSON.stringify(_message));
    }
};
// Helper function for searching through a collection, finding objects by key and value, returning
// Object that has that value
// tslint:disable-next-line: no-any
AuthoritativeSignalingServer.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
    for (const propertyObject in collectionToSearch) {
        if (AuthoritativeSignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
            // tslint:disable-next-line: typedef
            const objectToSearchThrough = collectionToSearch[propertyObject];
            if (objectToSearchThrough[key] === propertyValue) {
                return objectToSearchThrough;
            }
        }
    }
    return null;
};
AuthoritativeSignalingServer.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
    return AuthoritativeSignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
};
AuthoritativeSignalingServer.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
    return AuthoritativeSignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
};
AuthoritativeSignalingServer.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
    return AuthoritativeSignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
};
exports.AuthoritativeSignalingServer = AuthoritativeSignalingServer;
// AuthoritativeSignalingServer.startUpServer();
