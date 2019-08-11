"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TYPES = __importStar(require("./../DataCollectors/Enumerators/EnumeratorCollection"));
class AuthoritativeServer {
    constructor() {
        this.peerConnectedClientCollection = new Array();
        console.log("AuthoritativeServerStartet");
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
AuthoritativeServer.createID = () => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
};
// TODO Type Websocket not assignable to type WebSocket ?!
AuthoritativeServer.sendTo = (_connection, _message) => {
    _connection.send(JSON.stringify(_message));
};
// private initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer: string): void => {
//     console.log("Creating Datachannel for connection and then creating offer");
//     this.localDataChannel = this.connection.createDataChannel("localDataChannel");
//     this.localDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
//     this.localDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
//     this.localDataChannel.addEventListener("message", this.dataChannelMessageHandler);
//     this.connection.createOffer()
//         .then(async (offer) => {
//             console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.connection.signalingState);
//             return offer;
//         })
//         .then(async (offer) => {
//             await this.connection.setLocalDescription(offer);
//             console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.connection.signalingState);
//         })
//         .then(() => {
//             this.createOfferMessageAndSendToRemote(_userNameForOffer);
//         })
//         .catch(() => {
//             console.error("Offer creation error");
//         });
// }
// private createOfferMessageAndSendToRemote = (_userNameForOffer: string) => {
//     const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(this.localId, _userNameForOffer, this.connection.localDescription);
//     this.sendMessage(offerMessage);
//     console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.connection.signalingState);
// }
// Helper function for searching through a collection, finding objects by key and value, returning
// Object that has that value
// tslint:disable-next-line: no-any
AuthoritativeServer.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
    for (const propertyObject in collectionToSearch) {
        if (collectionToSearch.hasOwnProperty(propertyObject)) {
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
exports.AuthoritativeServer = AuthoritativeServer;
