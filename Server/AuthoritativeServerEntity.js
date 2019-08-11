"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkMessages = __importStar(require("../NetworkMessages"));
const TYPES = __importStar(require("../DataCollectors/Enumerators/EnumeratorCollection"));
const AuthoritativeSignalingServer_1 = require("./AuthoritativeSignalingServer");
class AuthoritativeServerEntity {
    constructor() {
        this.notYetPeerConnectedClientCollection = new Array();
        this.peerConnectedClientCollection = new Array();
        this.peerConnectionBufferCollection = new Array();
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        this.collectClientCreatePeerConnectionAndCreateOffer = (_freshlyConnectedClient) => {
            let newPeerConnection = new RTCPeerConnection(this.configuration);
            _freshlyConnectedClient.peerConnection = newPeerConnection;
            this.notYetPeerConnectedClientCollection.push(_freshlyConnectedClient);
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(_freshlyConnectedClient);
        };
        this.createID = () => {
            // Math.random should be random enough because of it's seed
            // convert to base 36 and pick the first few digits after comma
            return "_" + Math.random().toString(36).substr(2, 7);
        };
        //#endregion
        this.parseMessageToJson = (_messageToParse) => {
            let parsedMessage = { originatorId: " ", messageType: TYPES.MESSAGE_TYPE.UNDEFINED };
            try {
                parsedMessage = JSON.parse(_messageToParse);
            }
            catch (error) {
                console.error("Invalid JSON", error);
            }
            return parsedMessage;
        };
        this.receiveAnswerAndSetRemoteDescription = (_websocketClient, _answer) => {
            console.log("Received answer");
            let clientToConnect = this.searchUserByWebsocketConnectionAndReturnUser(_websocketClient, this.notYetPeerConnectedClientCollection);
            console.log(clientToConnect);
            let descriptionAnswer = new RTCSessionDescription(_answer.answer);
            clientToConnect.peerConnection.setRemoteDescription(descriptionAnswer);
            console.log("Remote Description set");
        };
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_clientToConnect) => {
            console.log("Initiating connection to : " + _clientToConnect);
            let newDataChannel = _clientToConnect.peerConnection.createDataChannel(_clientToConnect.id);
            // newDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
            // newDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            // newDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            _clientToConnect.peerConnection.createOffer()
                .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", _clientToConnect.peerConnection.signalingState);
                return offer;
            })
                .then(async (offer) => {
                await _clientToConnect.peerConnection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", _clientToConnect.peerConnection.signalingState);
            })
                .then(() => {
                this.createOfferMessageAndSendToRemote(_clientToConnect);
            })
                .catch(() => {
                console.error("Offer creation error");
            });
        };
        this.createOfferMessageAndSendToRemote = (_clientToConnect) => {
            console.log("Sending offer now");
            const offerMessage = new NetworkMessages.RtcOffer("SERVER", _clientToConnect.id, _clientToConnect.peerConnection.localDescription);
            AuthoritativeSignalingServer_1.AuthoritativeSignalingServer.sendToId(_clientToConnect.id, offerMessage);
        };
        // Helper function for searching through a collection, finding objects by key and value, returning
        // Object that has that value
        // tslint:disable-next-line: no-any
        this.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
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
        this.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
            return this.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
        };
        this.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
            return this.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
        };
        this.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
            return this.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
        };
        console.log("AuthoritativeServerStartet");
    }
}
exports.AuthoritativeServerEntity = AuthoritativeServerEntity;
