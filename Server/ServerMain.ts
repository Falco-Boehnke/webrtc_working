import * as WebSocket from "ws";
import * as NetworkMessages from "./../NetworkMessages";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";

import { Client } from "./../DataCollectors/Client";
class ServerMain {
    public static websocketServer: WebSocket.Server;
    public static usersCollection: Client[] = new Array();


    public static startUpServer = () => {
        ServerMain.websocketServer = new WebSocket.Server({ port: 8080 });
        ServerMain.serverEventHandler();
    }
    // TODO PArameter mit Unterstrich
    // TODO Coding guidelines umsetzen

    // handle closing

    public static serverEventHandler = (): void => {
        ServerMain.websocketServer.on("connection", (_websocketClient: any) => {
            // _websocketClient = _websocketClient;
            console.log("User connected FRESH");

            const uniqueIdOnConnection: string = ServerMain.createID();
            const freshlyConnectedClient: Client = new Client(_websocketClient, uniqueIdOnConnection);
            ServerMain.usersCollection.push(freshlyConnectedClient);

            _websocketClient.on("message", (_message: string) => {
                ServerMain.serverHandleMessageType(_message, _websocketClient);
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
                // TODO Enums ALLCAPS_ENUM
                // TODO messageData.target doesn't work, gotta replace that to find client connection, probably use ID
                case TYPES.MESSAGE_TYPE.LOGIN_REQUEST:
                    ServerMain.addUserOnValidLoginRequest(_websocketClient, messageData);
                    break;

                case TYPES.MESSAGE_TYPE.RTC_OFFER:
                    ServerMain.sendRtcOfferToRequestedClient(_websocketClient, messageData);
                    break;

                case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                    ServerMain.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;

                case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                    ServerMain.sendIceCandidatesToRelevantPeers(_websocketClient, messageData);
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
        usernameTaken = ServerMain.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", ServerMain.usersCollection) != null;

        if (!usernameTaken) {
            console.log("Username available, logging in");
            const associatedWebsocketConnectionClient: Client =
                ServerMain.searchForPropertyValueInCollection
                    (_websocketConnection,
                     "clientConnection",
                     ServerMain.usersCollection);

            if (associatedWebsocketConnectionClient != null) {
                associatedWebsocketConnectionClient.userName = _messageData.loginUserName;
                ServerMain.sendTo(_websocketConnection, new NetworkMessages.LoginResponse(true, associatedWebsocketConnectionClient.id, associatedWebsocketConnectionClient.userName));
            }
        } else {
            ServerMain.sendTo(_websocketConnection, { type: "login", success: false });
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);

        if (requestedClient != null) {
            console.log("User for offer found", requestedClient);
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            ServerMain.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("Username to connect to doesn't exist"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: NetworkMessages.RtcAnswer): void {
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);
        const clientToSendAnswerTo = ServerMain.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
             "userName",
             ServerMain.usersCollection);

        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            const answerToSend: NetworkMessages.RtcAnswer = new NetworkMessages.RtcAnswer(_messageData.originatorId, clientToSendAnswerTo.userName, _messageData.answer);
            ServerMain.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: NetworkMessages.IceCandidate): void {
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        const clientToShareCandidatesWith = ServerMain.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
             "userName",
             ServerMain.usersCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate(_messageData.originatorId, clientToShareCandidatesWith.userName, _messageData.candidate);
            ServerMain.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
// tslint:disable-next-line: no-any
    public static searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            if (ServerMain.usersCollection.hasOwnProperty(propertyObject)) {
// tslint:disable-next-line: typedef
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }

    public static searchForClientWithId(_idToFind: string): Client {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.usersCollection);
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

    public static sendTo = (_connection: WebSocket, _message: Object) => {
        _connection.send(JSON.stringify(_message));
    }
}
ServerMain.startUpServer();
