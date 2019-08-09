import * as WebSocket from "ws";
import * as NetworkMessages from "./../NetworkMessages";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";

import { Client } from "./../DataCollectors/Client";
import { LoginResponse } from "./../NetworkMessages";
class AuthoritativeServer {
    public static websocketServer: WebSocket.Server;
    public static connectedWebsocketClients: Client[] = new Array();
    public static connectedClientPeerConnectionCollection: RTCPeerConnection[] = new Array();
    public static configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" }
        ]
    };


    public static startUpServer = () => {
        AuthoritativeServer.websocketServer = new WebSocket.Server({ port: 8080 });
        AuthoritativeServer.serverEventHandler();
    }
    // TODO PArameter mit Unterstrich
    // TODO Coding guidelines umsetzen

    // handle closing

    public static serverEventHandler = (): void => {
        AuthoritativeServer.websocketServer.on("connection", (_websocketClient: any) => {
            console.log("User connected FRESH");

            const uniqueIdOnConnection: string = AuthoritativeServer.createID();
            AuthoritativeServer.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
            const freshlyConnectedClient: Client = new Client(_websocketClient, uniqueIdOnConnection);

            AuthoritativeServer.connectedWebsocketClients.push(freshlyConnectedClient);

            _websocketClient.on("message", (_message: string) => {
                AuthoritativeServer.serverHandleMessageType(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
            });

        });
    }

    // TODO Check if event.type can be used for identification instead
    public static serverHandleMessageType(_message: string, _websocketClient: WebSocket): void {
        let parsedMessage: NetworkMessages.MessageBase | null = null;
        try {
            parsedMessage = JSON.parse(_message);

        } catch (error) {
            console.error("Invalid JSON", error);
        }
        // tslint:disable-next-line: no-any
        const messageData: any = parsedMessage;

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
    static dataChannelStatusChangeHandler = () => {
        throw new Error("Method not implemented.");

    }

    static dataChannelMessageHandler = (_event: MessageEvent) => {
        console.log("MEssage received: ", _event.data);

    }

    static beginPeerConnectionNegotiationWithClient = (_originatorId: string) => {
        console.log("Creating Datachannel for connection and then creating offer");
        console.log(RTCPeerConnection);
        let peerConnection: RTCPeerConnection = new RTCPeerConnection(AuthoritativeServer.configuration);

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

    }

    public static createOfferMessageAndSendToRemote = (_peerConnectionToEstablish: RTCPeerConnection, _userIdForOffer: string) => {
        const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer("Server", _userIdForOffer, _peerConnectionToEstablish.localDescription);
        AuthoritativeServer.sendTo(AuthoritativeServer.searchClientConnectionWithId(_userIdForOffer), offerMessage);
        console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", _peerConnectionToEstablish.signalingState);
    }
    //#region MessageHandler

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: Client = AuthoritativeServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", AuthoritativeServer.connectedWebsocketClients);

        if (requestedClient != null) {
            const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            AuthoritativeServer.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcAnswer): void {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo: Client = AuthoritativeServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeServer.connectedWebsocketClients);

        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                AuthoritativeServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: NetworkMessages.IceCandidate): void {
        const clientToShareCandidatesWith: Client = AuthoritativeServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeServer.connectedWebsocketClients);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            AuthoritativeServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions



    public static searchForClientWithId(_idToFind: string): Client {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedWebsocketClients);
    }

    public static searchClientConnectionWithId = (_idToFind: string): any => {
        let clientConnectionToFind = AuthoritativeServer.searchForClientWithId(_idToFind).clientConnection;

        if (clientConnectionToFind) {
            return clientConnectionToFind;
        }
        return null;
    }

    public static createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }
    //#endregion


    public static parseMessageToJson(_messageToParse: string): NetworkMessages.MessageBase {
        let parsedMessage: NetworkMessages.MessageBase = { originatorId: " ", messageType: TYPES.MESSAGE_TYPE.UNDEFINED };

        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    // TODO Type Websocket not assignable to type WebSocket ?!
    public static sendTo = (_connection: any, _message: Object) => {
        _connection.send(JSON.stringify(_message));
    }

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    private static searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
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
    }

    private static searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: Client[]): Client => {
        return AuthoritativeServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private static searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: Client[]): Client => {
        return AuthoritativeServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private static searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: Client[]) => {
        return AuthoritativeServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }
}
AuthoritativeServer.startUpServer();
