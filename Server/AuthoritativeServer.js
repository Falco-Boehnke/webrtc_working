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
class AuthoritativeServer {
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
                    console.error("Id assignment received as Server, assignment Confirmed");
                    AuthoritativeServer.beginPeerConnectionNegotiationWithClient(parsedMessage.originatorId);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    AuthoritativeServer.sendRtcOfferToRequestedClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    AuthoritativeServer.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;
                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    AuthoritativeServer.sendIceCandidatesToRelevantPeers(_websocketClient, messageData);
                    break;
                default:
                    console.log("Message type not recognized");
                    break;
            }
        }
    }
    //#region MessageHandler
    static sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = AuthoritativeServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", AuthoritativeServer.connectedWebsocketClients);
        if (requestedClient != null) {
            const offerMessage = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            AuthoritativeServer.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.error("User to connect to doesn't exist under that Name");
        }
    }
    static answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo = AuthoritativeServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeServer.connectedWebsocketClients);
        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                AuthoritativeServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }
    static sendIceCandidatesToRelevantPeers(_websocketClient, _messageData) {
        const clientToShareCandidatesWith = AuthoritativeServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeServer.connectedWebsocketClients);
        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            AuthoritativeServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }
    //#endregion
    //#region Helperfunctions
    static searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedWebsocketClients);
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
AuthoritativeServer.connectedWebsocketClients = new Array();
AuthoritativeServer.connectedClientPeerConnectionCollection = new Array();
AuthoritativeServer.configuration = {
    iceServers: [
        { urls: "stun:stun2.1.google.com:19302" },
        { urls: "stun:stun.example.com" }
    ]
};
AuthoritativeServer.startUpServer = () => {
    AuthoritativeServer.websocketServer = new WebSocket.Server({ port: 8080 });
    AuthoritativeServer.serverEventHandler();
};
// TODO PArameter mit Unterstrich
// TODO Coding guidelines umsetzen
// handle closing
AuthoritativeServer.serverEventHandler = () => {
    AuthoritativeServer.websocketServer.on("connection", (_websocketClient) => {
        console.log("User connected FRESH");
        const uniqueIdOnConnection = AuthoritativeServer.createID();
        AuthoritativeServer.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
        const freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
        AuthoritativeServer.connectedWebsocketClients.push(freshlyConnectedClient);
        _websocketClient.on("message", (_message) => {
            AuthoritativeServer.serverHandleMessageType(_message, _websocketClient);
        });
        _websocketClient.addEventListener("close", () => {
            console.error("Error at connection");
        });
    });
};
AuthoritativeServer.dataChannelStatusChangeHandler = () => {
    throw new Error("Method not implemented.");
};
AuthoritativeServer.dataChannelMessageHandler = (_event) => {
    console.log("MEssage received: ", _event.data);
};
AuthoritativeServer.beginPeerConnectionNegotiationWithClient = (_originatorId) => {
    console.log("Creating Datachannel for connection and then creating offer");
    console.log(RTCPeerConnection);
    let peerConnection = new RTCPeerConnection(AuthoritativeServer.configuration);
    const associatedDatachannel = peerConnection.createDataChannel("localDataChannel");
    associatedDatachannel.addEventListener("open", AuthoritativeServer.dataChannelStatusChangeHandler);
    associatedDatachannel.addEventListener("close", AuthoritativeServer.dataChannelStatusChangeHandler);
    associatedDatachannel.addEventListener("message", AuthoritativeServer.dataChannelMessageHandler);
    peerConnection.createOffer()
        .then(async (offer) => {
        console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", peerConnection.signalingState);
        return offer;
    })
        .then(async (offer) => {
        await peerConnection.setLocalDescription(offer);
        console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", peerConnection.signalingState);
    })
        .then(() => {
        AuthoritativeServer.createOfferMessageAndSendToRemote(peerConnection, _originatorId);
    })
        .catch(() => {
        console.error("Offer creation error");
    });
};
AuthoritativeServer.createOfferMessageAndSendToRemote = (_peerConnectionToEstablish, _userIdForOffer) => {
    const offerMessage = new NetworkMessages.RtcOffer("Server", _userIdForOffer, _peerConnectionToEstablish.localDescription);
    AuthoritativeServer.sendTo(AuthoritativeServer.searchClientConnectionWithId(_userIdForOffer), offerMessage);
    console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", _peerConnectionToEstablish.signalingState);
};
AuthoritativeServer.searchClientConnectionWithId = (_idToFind) => {
    let clientConnectionToFind = AuthoritativeServer.searchForClientWithId(_idToFind).clientConnection;
    if (clientConnectionToFind) {
        return clientConnectionToFind;
    }
    return null;
};
AuthoritativeServer.createID = () => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
};
// TODO Type Websocket not assignable to type WebSocket ?!
AuthoritativeServer.sendTo = (_connection, _message) => {
    _connection.send(JSON.stringify(_message));
};
// Helper function for searching through a collection, finding objects by key and value, returning
// Object that has that value
// tslint:disable-next-line: no-any
AuthoritativeServer.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
    for (const propertyObject in collectionToSearch) {
        if (AuthoritativeServer.connectedWebsocketClients.hasOwnProperty(propertyObject)) {
            // tslint:disable-next-line: typedef
            const objectToSearchThrough = collectionToSearch[propertyObject];
            if (objectToSearchThrough[key] === propertyValue) {
                return objectToSearchThrough;
            }
        }
    }
    return null;
};
AuthoritativeServer.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
    return AuthoritativeServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
};
AuthoritativeServer.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
    return AuthoritativeServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
};
AuthoritativeServer.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
    return AuthoritativeServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
};
AuthoritativeServer.startUpServer();
