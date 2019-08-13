import * as WebSocket from "ws";
// import * as NetworkMessages from "../NetworkMessages";
// import * as TYPES from "../DataCollectors/Enumerators/EnumeratorCollection";
import { Client } from "../DataCollectors/Client";
import { AuthoritativeServerEntity } from "./AuthoritativeServerEntity";
export class AuthoritativeSignalingServer {
    public static websocketServer: WebSocket.Server;
    public static connectedClientsCollection: Client[] = new Array();
    public static authoritativeServerEntity: AuthoritativeServerEntity;

    public static startUpServer = (_serverPort?: number) => {
        console.log(_serverPort);
        if (!_serverPort) {
            AuthoritativeSignalingServer.websocketServer = new WebSocket.Server({ port: 8080 });
        }
        else {
            AuthoritativeSignalingServer.websocketServer = new WebSocket.Server({ port: _serverPort });

        }
        AuthoritativeSignalingServer.authoritativeServerEntity = new AuthoritativeServerEntity();
        AuthoritativeSignalingServer.serverEventHandler();
    }

    public static closeDownServer = () => {
        AuthoritativeSignalingServer.websocketServer.close();
    }

    public static serverEventHandler = (): void => {
        AuthoritativeSignalingServer.websocketServer.on("connection", (_websocketClient: any) => {
            console.log("User connected to autho-SignalingServer");

            const uniqueIdOnConnection: string = AuthoritativeSignalingServer.createID();
            const freshlyConnectedClient: Client = new Client(_websocketClient, uniqueIdOnConnection);
            AuthoritativeSignalingServer.sendTo(_websocketClient, new NetworkMessages.IdAssigned(uniqueIdOnConnection));
            AuthoritativeSignalingServer.connectedClientsCollection.push(freshlyConnectedClient);
            
            AuthoritativeSignalingServer.authoritativeServerEntity.collectClientCreatePeerConnectionAndCreateOffer(freshlyConnectedClient);


            _websocketClient.on("message", (_message: string) => {
                AuthoritativeSignalingServer.serverHandleMessageType(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", (error: any) => {
                console.error("Error at connection", error);
                for (let i: number = 0; i < AuthoritativeSignalingServer.connectedClientsCollection.length; i++) {
                    if (AuthoritativeSignalingServer.connectedClientsCollection[i].clientConnection === _websocketClient) {
                        console.log("Client found, deleting");
                        AuthoritativeSignalingServer.connectedClientsCollection.splice(i, 1);
                        console.log(AuthoritativeSignalingServer.connectedClientsCollection);
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

                case NetworkTypes.MESSAGE_TYPE.RTC_ANSWER:
                    AuthoritativeSignalingServer.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;

                case NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE:
                    AuthoritativeSignalingServer.sendIceCandidatesToRelevantPeers(messageData);
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
        usernameTaken = AuthoritativeSignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, AuthoritativeSignalingServer.connectedClientsCollection) != null;

        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn: Client = AuthoritativeSignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, AuthoritativeSignalingServer.connectedClientsCollection);

            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                AuthoritativeSignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        } else {
            AuthoritativeSignalingServer.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: Client = AuthoritativeSignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", AuthoritativeSignalingServer.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            AuthoritativeSignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcAnswer): void {
        console.log("Sending answer to AS-Entity");
        AuthoritativeSignalingServer.authoritativeServerEntity.receiveAnswerAndSetRemoteDescription(_websocketClient, _messageData);

    }

    public static sendIceCandidatesToRelevantPeers(_messageData: NetworkMessages.IceCandidate): void {
        const clientToShareCandidatesWith: Client = AuthoritativeSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, AuthoritativeSignalingServer.connectedClientsCollection);
        this.authoritativeServerEntity.addIceCandidateToServerConnection(_messageData);
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
        let parsedMessage: NetworkMessages.MessageBase = { originatorId: " ", messageType: NetworkTypes.MESSAGE_TYPE.UNDEFINED};

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

    public static sendToId = (_clientId: string, _message: Object) => {
        let client = AuthoritativeSignalingServer.searchForClientWithId(_clientId);
        if (client.clientConnection) {
            client.clientConnection.send(JSON.stringify(_message));
        }

    }

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    private static searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            if (AuthoritativeSignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
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
        return AuthoritativeSignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private static searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: Client[]): Client => {
        return AuthoritativeSignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private static searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: Client[]) => {
        return AuthoritativeSignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }
}
// AuthoritativeSignalingServer.startUpServer();
