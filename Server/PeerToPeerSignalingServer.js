"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
// import * as FudgeNetwork.from "../FudgeNetwork.;
// import * as TYPES from "../DataCollectors/Enumerators/EnumeratorCollection";
// import { FudgeNetwork.Client } from "../DataCollectors/FudgeNetwork.Client";
class PeerToPeerSignalingServer {
    // TODO Check if event.type can be used for identification instead => It cannot
    static serverHandleMessageType(_message, _websocketClient) {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(_message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        const messageData = parsedMessage;
        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                case NetworkTypes.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("Id confirmation received for client: " + parsedMessage.originatorId);
                    break;
                case NetworkTypes.MESSAGE_TYPE.LOGIN_REQUEST:
                    PeerToPeerSignalingServer.addUserOnValidLoginRequest(_websocketClient, messageData);
                    break;
                case NetworkTypes.MESSAGE_TYPE.RTC_OFFER:
                    PeerToPeerSignalingServer.sendRtcOfferToRequestedClient(_websocketClient, messageData);
                    break;
                case NetworkTypes.MESSAGE_TYPE.RTC_ANSWER:
                    PeerToPeerSignalingServer.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;
                case NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE:
                    PeerToPeerSignalingServer.sendIceCandidatesToRelevantPeers(_websocketClient, messageData);
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
        usernameTaken = PeerToPeerSignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, PeerToPeerSignalingServer.connectedClientsCollection) != null;
        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn = PeerToPeerSignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, PeerToPeerSignalingServer.connectedClientsCollection);
            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                PeerToPeerSignalingServer.sendTo(_websocketConnection, new FudgeNetwork.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        }
        else {
            PeerToPeerSignalingServer.sendTo(_websocketConnection, new FudgeNetwork.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }
    static sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = PeerToPeerSignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", PeerToPeerSignalingServer.connectedClientsCollection);
        if (requestedClient != null) {
            const offerMessage = new FudgeNetwork.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            PeerToPeerSignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.error("User to connect to doesn't exist under that Name");
        }
    }
    static answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo = PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, PeerToPeerSignalingServer.connectedClientsCollection);
        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: FudgeNetwork.RtcAnswer = new FudgeNetwork.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                PeerToPeerSignalingServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }
    static sendIceCandidatesToRelevantPeers(_websocketClient, _messageData) {
        const clientToShareCandidatesWith = PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, PeerToPeerSignalingServer.connectedClientsCollection);
        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new FudgeNetwork.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            PeerToPeerSignalingServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }
    //#endregion
    //#region Helperfunctions
    static searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    }
    //#endregion
    static parseMessageToJson(_messageToParse) {
        let parsedMessage = { originatorId: " ", messageType: NetworkTypes.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_messageToParse);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }
}
PeerToPeerSignalingServer.connectedClientsCollection = new Array();
PeerToPeerSignalingServer.startUpServer = (_serverPort) => {
    console.log(_serverPort);
    if (!_serverPort) {
        PeerToPeerSignalingServer.websocketServer = new ws_1.default.Server({ port: 8080 });
    }
    else {
        PeerToPeerSignalingServer.websocketServer = new ws_1.default.Server({ port: _serverPort });
    }
    PeerToPeerSignalingServer.serverEventHandler();
};
PeerToPeerSignalingServer.closeDownServer = () => {
    PeerToPeerSignalingServer.websocketServer.close();
};
PeerToPeerSignalingServer.serverEventHandler = () => {
    PeerToPeerSignalingServer.websocketServer.on("connection", (_websocketClient) => {
        console.log("User connected to P2P SignalingServer");
        const uniqueIdOnConnection = PeerToPeerSignalingServer.createID();
        PeerToPeerSignalingServer.sendTo(_websocketClient, new FudgeNetwork.IdAssigned(uniqueIdOnConnection));
        const freshlyConnectedClient = new FudgeNetwork.Client(_websocketClient, uniqueIdOnConnection);
        PeerToPeerSignalingServer.connectedClientsCollection.push(freshlyConnectedClient);
        _websocketClient.on("message", (_message) => {
            PeerToPeerSignalingServer.serverHandleMessageType(_message, _websocketClient);
        });
        _websocketClient.addEventListener("close", () => {
            console.error("Error at connection");
            for (let i = 0; i < PeerToPeerSignalingServer.connectedClientsCollection.length; i++) {
                if (PeerToPeerSignalingServer.connectedClientsCollection[i].clientConnection === _websocketClient) {
                    console.log("FudgeNetwork.Client found, deleting");
                    PeerToPeerSignalingServer.connectedClientsCollection.splice(i, 1);
                    console.log(PeerToPeerSignalingServer.connectedClientsCollection);
                }
                else {
                    console.log("Wrong client to delete, moving on");
                }
            }
        });
    });
};
PeerToPeerSignalingServer.createID = () => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
};
// TODO Type Websocket not assignable to type WebSocket ?!
PeerToPeerSignalingServer.sendTo = (_connection, _message) => {
    _connection.send(JSON.stringify(_message));
};
// Helper function for searching through a collection, finding objects by key and value, returning
// Object that has that value
// tslint:disable-next-line: no-any
PeerToPeerSignalingServer.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
    for (const propertyObject in collectionToSearch) {
        if (PeerToPeerSignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
            // tslint:disable-next-line: typedef
            const objectToSearchThrough = collectionToSearch[propertyObject];
            if (objectToSearchThrough[key] === propertyValue) {
                return objectToSearchThrough;
            }
        }
    }
    return null;
};
PeerToPeerSignalingServer.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
    return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
};
PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
    return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
};
PeerToPeerSignalingServer.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
    return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
};
exports.PeerToPeerSignalingServer = PeerToPeerSignalingServer;
// PeerToPeerSignalingServer.startUpServer();
