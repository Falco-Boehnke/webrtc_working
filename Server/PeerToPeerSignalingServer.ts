import WebSocket from "ws";

// import * as FudgeNetwork.from "../FudgeNetwork.;
// import * as TYPES from "../DataCollectors/Enumerators/EnumeratorCollection";
// import { FudgeNetwork.Client } from "../DataCollectors/FudgeNetwork.Client";

export class PeerToPeerSignalingServer {
    public static websocketServer: WebSocket.Server;
    public static connectedClientsCollection: FudgeNetwork.Client[] = new Array();


    public static startUpServer = (_serverPort?: number) => {
        console.log(_serverPort);
        if (!_serverPort) {
            PeerToPeerSignalingServer.websocketServer = new WebSocket.Server({ port: 8080 });
        }
        else {
            PeerToPeerSignalingServer.websocketServer = new WebSocket.Server({ port: _serverPort });

        }
        PeerToPeerSignalingServer.serverEventHandler();
    }

    public static closeDownServer = () => {
        PeerToPeerSignalingServer.websocketServer.close();
    }
    public static serverEventHandler = (): void => {
        PeerToPeerSignalingServer.websocketServer.on("connection", (_websocketClient: any) => {
            console.log("User connected to P2P SignalingServer");

            const uniqueIdOnConnection: string = PeerToPeerSignalingServer.createID();
            PeerToPeerSignalingServer.sendTo(_websocketClient, new FudgeNetwork.IdAssigned(uniqueIdOnConnection));
            const freshlyConnectedClient: FudgeNetwork.Client = new FudgeNetwork.Client(_websocketClient, uniqueIdOnConnection);
            PeerToPeerSignalingServer.connectedClientsCollection.push(freshlyConnectedClient);

            _websocketClient.on("message", (_message: string) => {
                PeerToPeerSignalingServer.serverHandleMessageType(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i: number = 0; i < PeerToPeerSignalingServer.connectedClientsCollection.length; i++) {
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
    }

    // TODO Check if event.type can be used for identification instead => It cannot
    public static serverHandleMessageType(_message: string, _websocketClient: WebSocket): void {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(_message);

        } catch (error) {
            console.error("Invalid JSON", error);
        }

        const messageData: any = parsedMessage;

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
    public static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.LoginRequest): void {
        console.log("User logged: ", _messageData.loginUserName);
        let usernameTaken: boolean = true;
        usernameTaken = PeerToPeerSignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, PeerToPeerSignalingServer.connectedClientsCollection) != null;

        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn: FudgeNetwork.Client = PeerToPeerSignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, PeerToPeerSignalingServer.connectedClientsCollection);

            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                PeerToPeerSignalingServer.sendTo(_websocketConnection, new FudgeNetwork.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        } else {
            PeerToPeerSignalingServer.sendTo(_websocketConnection, new FudgeNetwork.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: FudgeNetwork.Client = PeerToPeerSignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", PeerToPeerSignalingServer.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: FudgeNetwork.RtcOffer = new FudgeNetwork.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            PeerToPeerSignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.RtcAnswer): void {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo: FudgeNetwork.Client = PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, PeerToPeerSignalingServer.connectedClientsCollection);

        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: FudgeNetwork.RtcAnswer = new FudgeNetwork.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                PeerToPeerSignalingServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: FudgeNetwork.IceCandidate): void {
        const clientToShareCandidatesWith: FudgeNetwork.Client = PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, PeerToPeerSignalingServer.connectedClientsCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: FudgeNetwork.IceCandidate = new FudgeNetwork.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            PeerToPeerSignalingServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions



    public static searchForClientWithId(_idToFind: string): FudgeNetwork.Client {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    }

    public static createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }
    //#endregion


    public static parseMessageToJson(_messageToParse: string): FudgeNetwork.MessageBase {
        let parsedMessage: FudgeNetwork.MessageBase = { originatorId: " ", messageType: NetworkTypes.MESSAGE_TYPE.UNDEFINED};

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
            if (PeerToPeerSignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
                // tslint:disable-next-line: typedef
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }

    private static searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: FudgeNetwork.Client[]): FudgeNetwork.Client => {
        return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private static searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: FudgeNetwork.Client[]): FudgeNetwork.Client => {
        return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private static searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: FudgeNetwork.Client[]) => {
        return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }
}
// PeerToPeerSignalingServer.startUpServer();
