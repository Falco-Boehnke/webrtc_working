"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    class AuthoritativeServerEntity {
        constructor() {
            this.notYetPeerConnectedClientCollection = new Array();
            this.peerConnectedClientCollection = new Array();
            this.peerConnectionBufferCollection = new Array();
            // tslint:disable-next-line: typedef
            this.configuration = {
                iceServers: [
                    { urls: "stun:stun2.1.google.com:19302" },
                    { urls: "stun:stun.example.com" }
                ]
            };
            this.collectClientCreatePeerConnectionAndCreateOffer = (_freshlyConnectedClient) => {
                let newPeerConnection = new RTCPeerConnection(this.configuration);
                newPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
                _freshlyConnectedClient.peerConnection = newPeerConnection;
                this.notYetPeerConnectedClientCollection.push(_freshlyConnectedClient);
                this.initiateConnectionByCreatingDataChannelAndCreatingOffer(_freshlyConnectedClient);
            };
            this.createID = () => {
                // Math.random should be random enough because of it's seed
                // convert to base 36 and pick the first few digits after comma
                return "_" + Math.random().toString(36).substr(2, 7);
            };
            this.addIceCandidateToServerConnection = async (_receivedIceMessage) => {
                if (_receivedIceMessage.candidate) {
                    let client = this.searchUserByUserIdAndReturnUser(_receivedIceMessage.originatorId, this.notYetPeerConnectedClientCollection);
                    console.log("server received candidates from: ", client);
                    await client.peerConnection.addIceCandidate(_receivedIceMessage.candidate);
                }
            };
            this.parseMessageToJson = (_messageToParse) => {
                let parsedMessage = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
                try {
                    parsedMessage = JSON.parse(_messageToParse);
                }
                catch (error) {
                    console.error("Invalid JSON", error);
                }
                return parsedMessage;
            };
            // tslint:disable-next-line: no-any
            this.receiveAnswerAndSetRemoteDescription = (_websocketClient, _answer) => {
                console.log("Received answer");
                let clientToConnect = this.searchUserByWebsocketConnectionAndReturnUser(_websocketClient, this.notYetPeerConnectedClientCollection);
                console.log(clientToConnect);
                let descriptionAnswer = new RTCSessionDescription(_answer.answer);
                clientToConnect.peerConnection.setRemoteDescription(descriptionAnswer);
                console.log("Remote Description set");
            };
            this.broadcastMessageToAllConnectedClients = (_messageToBroadcast) => {
                this.notYetPeerConnectedClientCollection.forEach(client => {
                    console.log(client.dataChannel);
                    client.dataChannel.send(_messageToBroadcast);
                });
            };
            // TODO Use or delete
            // tslint:disable-next-line: no-any
            this.sendNewIceCandidatesToPeer = ({ candidate }) => {
                console.log("Server wants to send ice candidates to peer.", candidate);
                // let message: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate("SERVER", this.remoteClientId, candidate);
                // this.sendMessage(message);
            };
            // tslint:disable-next-line: no-any
            this.dataChannelStatusChangeHandler = (event) => {
                console.log("Server Datachannel opened");
            };
            this.dataChannelMessageHandler = (_message) => {
                console.log("Message received", _message);
                // tslint:disable-next-line: no-any
                let parsedMessage = JSON.parse(_message.data);
                switch (parsedMessage.messageType) {
                    case FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND:
                        this.handleServerCommands(parsedMessage);
                }
            };
            this.handleServerCommands = (_commandMessage) => {
                switch (_commandMessage.commandType) {
                    case FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT:
                        this.disconnectClientByOwnCommand(_commandMessage);
                        break;
                    case FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT:
                        this.handleKeyInputFromClient(_commandMessage);
                        break;
                    default:
                        console.log("No idea what message this is", _commandMessage);
                        break;
                }
            };
            this.disconnectClientByOwnCommand = (_commandMessage) => {
                let clientToDisconnect = this.searchUserByUserIdAndReturnUser(_commandMessage.originatorId, this.notYetPeerConnectedClientCollection);
                clientToDisconnect.dataChannel.close();
            };
            this.handleKeyInputFromClient = (_commandMessage) => {
                console.log(_commandMessage);
                if (FudgeNetwork.UiElementHandler.moveableBoxElement) {
                    FudgeNetwork.UiElementHandler.moveableBoxElement.textContent = _commandMessage.pressedKey + "";
                }
            };
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_clientToConnect) => {
                console.log("Initiating connection to : " + _clientToConnect);
                let newDataChannel = _clientToConnect.peerConnection.createDataChannel(_clientToConnect.id);
                _clientToConnect.dataChannel = newDataChannel;
                newDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
                // newDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
                newDataChannel.addEventListener("message", this.dataChannelMessageHandler);
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
                const offerMessage = new FudgeNetwork.NetworkMessageRtcOffer("SERVER", _clientToConnect.id, _clientToConnect.peerConnection.localDescription);
                this.signalingServer.sendToId(_clientToConnect.id, offerMessage);
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
    FudgeNetwork.AuthoritativeServerEntity = AuthoritativeServerEntity;
})(FudgeNetwork || (FudgeNetwork = {}));
