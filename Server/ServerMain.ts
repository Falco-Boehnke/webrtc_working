import * as WebSocket from "ws";
///<reference path="../DataCollectors/Enumerators/EnumeratorCollection.ts"/>
///<reference path="./../NetworkMessages/IceCandidate.ts"/>
///<reference path="./../NetworkMessages/LoginRequest.ts"/>
///<reference path="./../NetworkMessages/MessageBase.ts"/>
///<reference path="./../NetworkMessages/RtcAnswer.ts"/>
///<reference path="./../NetworkMessages/RtcOffer.ts"/>


import { Client } from "./../DataCollectors/Client";

// import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
// import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
// import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
// import { MessageLoginRequest } from "../NetworkMessages/MessageLoginRequest";
// import { MessageOffer } from "../NetworkMessages/MessageOffer";
class  ServerMain {
    public static websocketServer: WebSocket.Server;
    public static users = {};
    public static usersCollection = new Array();


    public static startUpServer(){
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

            const uniqueIdOnConnection = ServerMain.createID();
            const freshlyConnectedClient = new Client(_websocketClient, uniqueIdOnConnection);
            ServerMain.usersCollection.push(freshlyConnectedClient);

            _websocketClient.on("message", ServerMain.serverHandleMessageType);

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
            });

        });
    }

    // TODO Check if event.type can be used for identification instead
    public static serverHandleMessageType(_message: string): void {
        let parsedMessage: NetworkMessages.MessageBase | null = null;
        console.log(_message);
        try {
            parsedMessage = JSON.parse(_message);

        } catch (error) {
            console.error("Invalid JSON", error);
        }
        const messageData: any = parsedMessage;

        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                // TODO Enums ALLCAPS_ENUM
                // TODO messageData.target doesn't work, gotta replace that to find client connection, probably use ID
                case MESSAGE_TYPE.LOGIN:
                    ServerMain.addUserOnValidLoginRequest(messageData.target, messageData);
                    break;

                case MESSAGE_TYPE.RTC_OFFER:
                    ServerMain.sendRtcOfferToRequestedClient(messageData);
                    break;

                case MESSAGE_TYPE.RTC_ANSWER:
                    ServerMain.answerRtcOfferOfClient(messageData);
                    break;

                case MESSAGE_TYPE.RTC_CANDIDATE:
                    ServerMain.sendIceCandidatesToRelevantPeers(messageData);
                    break;

                default:
                    console.log("Message type not recognized");
                    break;

            }
        }
    }

    //#region MessageHandler
    public static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: NetworkMessages.LoginRequest): void {
        console.log("User logged", _messageData.loginUserName);
        let usernameTaken: boolean = true;
        usernameTaken = ServerMain.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", ServerMain.usersCollection) != null;

        if (!usernameTaken) {
            const associatedWebsocketConnectionClient =
                ServerMain.searchForPropertyValueInCollection
                    (_websocketConnection,
                        "clientConnection",
                        ServerMain.usersCollection);

            if (associatedWebsocketConnectionClient != null) {
                associatedWebsocketConnectionClient.userName = _messageData.loginUserName;
                console.log("Changed name of client object");

                ServerMain.sendTo(_websocketConnection,
                    {
                        type: "login",
                        success: true,
                        id: associatedWebsocketConnectionClient.id,
                    },
                );
            }
        } else {
            ServerMain.sendTo(_websocketConnection, { type: "login", success: false });
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public static sendRtcOfferToRequestedClient(_messageData: NetworkMessages.RtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);

        if (requestedClient != null) {
            console.log("User for offer found", requestedClient);
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            const offerMessage = new NetworkMessages.RtcOffer(requestedClient.userName, _messageData.offer);
            ServerMain.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.log("Usernoame to connect to doesn't exist"); }
    }

    public static answerRtcOfferOfClient(_messageData: NetworkMessages.RtcAnswer): void {
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);

        const clientToSendAnswerTo = ServerMain.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
                "userName",
                ServerMain.usersCollection);

        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            const answerToSend = new NetworkMessages.RtcAnswer(clientToSendAnswerTo.userName, _messageData.answer);
            ServerMain.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_messageData: NetworkMessages.IceCandidate): void {
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        const clientToShareCandidatesWith = ServerMain.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
                "userName",
                ServerMain.usersCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkMessages.IceCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
            ServerMain.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    public static searchForPropertyValueInCollection(propertyValue: any, key: string, collectionToSearch: any[]) {
        for (const propertyObject in collectionToSearch) {
            if (ServerMain.usersCollection.hasOwnProperty(propertyObject)) {
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
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
        let parsedMessage: NetworkMessages.MessageBase = { messageType: MESSAGE_TYPE.UNDEFINED };

        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    public static sendTo(_connection: WebSocket, _message: Object) {
        _connection.send(JSON.stringify(_message));
    }
}
const defaultServer = ServerMain.startUpServer();
