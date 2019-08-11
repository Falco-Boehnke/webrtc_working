import * as WebSocket from "ws";
import * as NetworkMessages from "./../NetworkMessages";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";

import { Client } from "./../DataCollectors/Client";
class AuthoritativeServer {
    public static websocketServer: WebSocket.Server;
    public static connectedClientsCollection: Client[] = new Array();


    public static startUpServer = () => {
        AuthoritativeServer.websocketServer = new WebSocket.Server({ port: 8080 });
        AuthoritativeServer.serverEventHandler();
    }

    public static serverEventHandler = (): void => {
        AuthoritativeServer.websocketServer.on("connection", (_websocketClient: any) => {
            // _websocketClient = _websocketClient;
            console.log("User connected FRESH");

            const uniqueIdOnConnection: string = AuthoritativeServer.createID();
            AuthoritativeServer.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
            const freshlyConnectedClient: Client = new Client(_websocketClient, uniqueIdOnConnection);
            AuthoritativeServer.connectedClientsCollection.push(freshlyConnectedClient);

            _websocketClient.on("message", (_message: string) => {
                AuthoritativeServer.serverHandleMessageType(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i: number = 0; i < AuthoritativeServer.connectedClientsCollection.length; i++) {
                    if (AuthoritativeServer.connectedClientsCollection[i].clientConnection === _websocketClient) {
                        console.log("Client found, deleting");
                        AuthoritativeServer.connectedClientsCollection.splice(i, 1);
                        console.log(AuthoritativeServer.connectedClientsCollection);
                    }
                    else {
                        console.log("Wrong client to delete, moving on");
                    }
                }
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
                    console.error("Id assignment received as Server");
                    break;

                case TYPES.MESSAGE_TYPE.LOGIN_REQUEST:
                    AuthoritativeServer.addUserOnValidLoginRequest(_websocketClient, messageData);
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
    public static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: NetworkMessages.LoginRequest): void {
        console.log("User logged: ", _messageData.loginUserName);
        let usernameTaken: boolean = true;
        usernameTaken = AuthoritativeServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, AuthoritativeServer.connectedClientsCollection) != null;

        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn: Client = AuthoritativeServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, AuthoritativeServer.connectedClientsCollection);

            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                AuthoritativeServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        } else {
            AuthoritativeServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: Client = AuthoritativeServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", AuthoritativeServer.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            AuthoritativeServer.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcAnswer): void {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo: Client = AuthoritativeServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeServer.connectedClientsCollection);

        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            // clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            // const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            if (clientToSendAnswerTo.clientConnection != null)
                AuthoritativeServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: NetworkMessages.IceCandidate): void {
        const clientToShareCandidatesWith: Client = AuthoritativeServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeServer.connectedClientsCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            AuthoritativeServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
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
            if (AuthoritativeServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
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
