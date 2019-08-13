namespace FudgeNetwork {
    export class AuthoritativeServerEntity {

        // tslint:disable-next-line: no-any
        public signalingServer: any;
        public notYetPeerConnectedClientCollection: Client[] = new Array();
        public peerConnectedClientCollection: Client[] = new Array();
        public peerConnectionBufferCollection: RTCDataChannel[] = new Array();

        // tslint:disable-next-line: typedef
        public configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };

        constructor() {
            console.log("AuthoritativeServerStartet");
        }

        public collectClientCreatePeerConnectionAndCreateOffer = (_freshlyConnectedClient: Client) => {
            let newPeerConnection: RTCPeerConnection = new RTCPeerConnection(this.configuration);
            newPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
            _freshlyConnectedClient.peerConnection = newPeerConnection;
            this.notYetPeerConnectedClientCollection.push(_freshlyConnectedClient);
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(_freshlyConnectedClient);
        }

        public createID = (): string => {
            // Math.random should be random enough because of it's seed
            // convert to base 36 and pick the first few digits after comma
            return "_" + Math.random().toString(36).substr(2, 7);
        }
        public addIceCandidateToServerConnection = async (_receivedIceMessage: NetworkMessageIceCandidate) => {
            if (_receivedIceMessage.candidate) {
                let client: Client = this.searchUserByUserIdAndReturnUser(_receivedIceMessage.originatorId, this.notYetPeerConnectedClientCollection);
                console.log("server received candidates from: ", client);
                await client.peerConnection.addIceCandidate(_receivedIceMessage.candidate);
            }
        }

        public parseMessageToJson = (_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase => {
            let parsedMessage: FudgeNetwork.NetworkMessageMessageBase = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };

            try {
                parsedMessage = JSON.parse(_messageToParse);
            } catch (error) {
                console.error("Invalid JSON", error);
            }
            return parsedMessage;
        }

        // tslint:disable-next-line: no-any
        public receiveAnswerAndSetRemoteDescription = (_websocketClient: any, _answer: FudgeNetwork.NetworkMessageRtcAnswer) => {
            console.log("Received answer");
            let clientToConnect: Client = this.searchUserByWebsocketConnectionAndReturnUser(_websocketClient, this.notYetPeerConnectedClientCollection);
            console.log(clientToConnect);
            let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_answer.answer);
            clientToConnect.peerConnection.setRemoteDescription(descriptionAnswer);
            console.log("Remote Description set");
        }

        public broadcastMessageToAllConnectedClients = (_messageToBroadcast: string) => {
            this.notYetPeerConnectedClientCollection.forEach(client => {
                console.log(client.dataChannel);
                client.dataChannel.send(_messageToBroadcast);
            });

        }

        // TODO Use or delete
        // tslint:disable-next-line: no-any
        private sendNewIceCandidatesToPeer = ({ candidate }: any) => {
            console.log("Server wants to send ice candidates to peer.", candidate);
            // let message: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate("SERVER", this.remoteClientId, candidate);
            // this.sendMessage(message);

        }

        // tslint:disable-next-line: no-any
        private dataChannelStatusChangeHandler = (event: any) => {
            console.log("Server Datachannel opened");
        }

        private dataChannelMessageHandler = (_message: MessageEvent) => {
            console.log("Message received", _message);
            let parsedMessage: any = JSON.parse(_message.data);

            console.log("Keycode: " + parsedMessage);

            console.log(".");
            console.log("ID: " + parsedMessage.originatorId);
            console.log("MessageType: " + parsedMessage.messageType);
            console.log("MessageData: " + parsedMessage.messageData);
            console.log(".");
        }

        private initiateConnectionByCreatingDataChannelAndCreatingOffer = (_clientToConnect: Client): void => {
            console.log("Initiating connection to : " + _clientToConnect);
            let newDataChannel: RTCDataChannel = _clientToConnect.peerConnection.createDataChannel(_clientToConnect.id);
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
        }

        private createOfferMessageAndSendToRemote = (_clientToConnect: Client) => {
            console.log("Sending offer now");
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer("SERVER", _clientToConnect.id, _clientToConnect.peerConnection.localDescription);
            this.signalingServer.sendToId(_clientToConnect.id, offerMessage);
        }






        // Helper function for searching through a collection, finding objects by key and value, returning
        // Object that has that value
        // tslint:disable-next-line: no-any
        private searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
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
        }

        private searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: Client[]): Client => {
            return this.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
        }
        private searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: Client[]): Client => {
            return this.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
        }

        private searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: Client[]) => {
            return this.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
        }

        // public static searchForClientWithId(_idToFind: string): Client {
        //     return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
        // }


    }
}