import * as WebSocket from "ws";
import * as NetworkMessages from "../NetworkMessages";
import * as TYPES from "../DataCollectors/Enumerators/EnumeratorCollection";
import { Client } from "../DataCollectors/Client";

export class SignalingServer {
    public static websocketServer: WebSocket.Server;
    public static connectedClientsCollection: Client[] = new Array();


    public static startUpServer = (_serverPort?: number) => {
        console.log(_serverPort);
        if (!_serverPort) {
            SignalingServer.websocketServer = new WebSocket.Server({ port: 8080 });
        }
        else {
            SignalingServer.websocketServer = new WebSocket.Server({ port: _serverPort });

        }
        SignalingServer.serverEventHandler();
    }

    public static serverEventHandler = (): void => {
        SignalingServer.websocketServer.on("connection", (_websocketClient: any) => {
            // _websocketClient = _websocketClient;
            console.log("User connected FRESH");

            const uniqueIdOnConnection: string = SignalingServer.createID();
            SignalingServer.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
            const freshlyConnectedClient: Client = new Client(_websocketClient, uniqueIdOnConnection);
            SignalingServer.connectedClientsCollection.push(freshlyConnectedClient);

            _websocketClient.on("message", (_message: string) => {
                SignalingServer.serverHandleMessageType(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i: number = 0; i < SignalingServer.connectedClientsCollection.length; i++) {
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
    }

    // TODO Check if event.type can be used for identification instead => It cannot
    public static serverHandleMessageType(_message: string, _websocketClient: WebSocket): void {
        let parsedMessage: NetworkMessages.MessageBase | null = null;
        try {
            parsedMessage = JSON.parse(_message);

        } catch (error) {
            console.error("Invalid JSON", error);
        }

        const messageData: any = parsedMessage;

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
    public static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: NetworkMessages.LoginRequest): void {
        console.log("User logged: ", _messageData.loginUserName);
        let usernameTaken: boolean = true;
        usernameTaken = SignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, SignalingServer.connectedClientsCollection) != null;

        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn: Client = SignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, SignalingServer.connectedClientsCollection);

            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                SignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        } else {
            SignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: Client = SignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", SignalingServer.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            SignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcAnswer): void {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo: Client = SignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, SignalingServer.connectedClientsCollection);

        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                SignalingServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: NetworkMessages.IceCandidate): void {
        const clientToShareCandidatesWith: Client = SignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, SignalingServer.connectedClientsCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            SignalingServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions



    public static searchForClientWithId(_idToFind: string): Client {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
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
            if (SignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
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
        return SignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private static searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: Client[]): Client => {
        return SignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private static searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: Client[]) => {
        return SignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }
}
// SignalingServer.startUpServer();
