import * as WebSocket from "ws";
import { Client } from "./../DataCollectors/Client";
// import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
// import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
// import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
// import { MessageLoginRequest } from "../NetworkMessages/MessageLoginRequest";
// import { MessageOffer } from "../NetworkMessages/MessageOffer";

abstract class ServerMain {
    public static websocketServer: WebSocket.Server;
    public static users = {};
    public static usersCollection = new Array();


    // TODO PArameter mit Unterstrich
    // TODO Coding guidelines umsetzen

    // handle closing

    public static serverEventHandler = (): void => {
        ServerMain.websocketServer.on("connection", (_websocketClient: any) => {
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

<<<<<<< HEAD
    // TODO Check if event.type can be used for identification instead, it cannot
    public static serverHandleMessageType = (_message: string): void => {
        let parsedMessage: NetworkCommunication.MessageBase | null = null;


=======
    // TODO Check if event.type can be used for identification instead
    public serverHandleMessageType(_message: string): void {
        let parsedMessage: NetworkMessages.MessageBase | null = null;
>>>>>>> master
        console.log(_message);
        try {
            parsedMessage = JSON.parse(_message);

        } catch (error) {
            console.error("Invalid JSON", error);
        }
        const messageData: any = parsedMessage;

        if (messageData) {
            switch (messageData.messageType) {
                // TODO Fehler liegt in messageData.target, muss client rausfinden ohne das
                case MESSAGE_TYPE.LOGIN:
                    ServerMain.AddUserIfLoginRequestIsValid(messageData.target, messageData);
                    break;

                case MESSAGE_TYPE.RTC_OFFER:
                    ServerMain.SendRTCOfferToSpecifiedUser(messageData);
                    break;

                case MESSAGE_TYPE.RTC_ANSWER:
                    ServerMain.SendRTCAnswerToOfferingUser(messageData);
                    break;

                case MESSAGE_TYPE.RTC_CANDIDATE:
                    ServerMain.SendAllValidIceCandidatesToPeer(messageData);
                    break;

                default:
                    console.log("Message type not recognized");
                    break;

            }
        }
    }

<<<<<<< HEAD
    public static AddUserIfLoginRequestIsValid = (_websocketConnection: WebSocket, _messageData: NetworkCommunication.MessageLoginRequest) => {
=======
    //#region MessageHandler
    public serverHandleLogin(_websocketConnection: WebSocket, _messageData: NetworkMessages.LoginRequest): void {
>>>>>>> master
        console.log("User logged", _messageData.loginUserName);
        const usernameTaken = ServerMain.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", ServerMain.usersCollection);

        if (!usernameTaken) {
            ServerMain.sendTo(_websocketConnection, { type: "login", success: false });
            console.log("UsernameTaken");
            // const associatedWebsocketConnectionClient =
            // ServerMain.searchForPropertyValueInCollection
            //         (_websocketConnection,
            //             "clientConnection",
            //             ServerMain.usersCollection);
            //             console.log(associatedWebsocketConnectionClient);

            // if (associatedWebsocketConnectionClient) {

            // }
        } else {
            usernameTaken.userName = _messageData.loginUserName;
            console.log("Changed name of client object");

            ServerMain.sendTo(_websocketConnection,
                {
                    type: "login",
                    success: true,
                    id: usernameTaken.id,
                },
            );
        }
    }

<<<<<<< HEAD
    public static SendRTCOfferToSpecifiedUser = (_messageData: NetworkCommunication.MessageOffer): void => {
=======
    public serverHandleRTCOffer(_messageData: NetworkMessages.RtcOffer): void {
>>>>>>> master
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = ServerMain.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", ServerMain.usersCollection);

        if (requestedClient != null) {
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
<<<<<<< HEAD
            const offerMessage = new NetworkCommunication.MessageOffer(requestedClient.userName, _messageData.offer);
            ServerMain.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.log("Usernoame to connect to doesn't exist"); }
    }

    public static SendRTCAnswerToOfferingUser = (_messageData: NetworkCommunication.MessageAnswer): void => {
=======
            const offerMessage = new NetworkMessages.RtcOffer(requestedClient.userName, _messageData.offer);
            this.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.log("Usernoame to connect to doesn't exist"); }
    }

    public serverHandleRTCAnswer(_messageData: NetworkMessages.RtcAnswer): void {
>>>>>>> master
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);

        const clientToSendAnswerTo = ServerMain.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
                "userName",
                ServerMain.usersCollection);

        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
<<<<<<< HEAD
            const answerToSend = new NetworkCommunication.MessageAnswer(clientToSendAnswerTo.userName, _messageData.answer);
            ServerMain.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    }

    public static SendAllValidIceCandidatesToPeer(_messageData: NetworkCommunication.MessageCandidate): void {
=======
            const answerToSend = new NetworkMessages.RtcAnswer(clientToSendAnswerTo.userName, _messageData.answer);
            this.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    }

    public serverHandleICECandidate(_messageData: NetworkMessages.IceCandidate): void {
>>>>>>> master
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        const clientToShareCandidatesWith = ServerMain.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
                "userName",
                ServerMain.usersCollection);

        if (clientToShareCandidatesWith != null) {
<<<<<<< HEAD
            const candidateToSend = new NetworkCommunication.MessageCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
            ServerMain.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
=======
            const candidateToSend = new NetworkMessages.IceCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
            this.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
>>>>>>> master
        }
    }


    //#region Helperfunctions

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    public static searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            console.log("SearchLoop", propertyObject);
            if (ServerMain.usersCollection.hasOwnProperty(propertyObject)) {
                console.log("Has own property");
                const objectToSearchThrough = collectionToSearch[propertyObject];
                console.log("Object thatis searched for property: ", objectToSearchThrough);
                if (objectToSearchThrough[key] === propertyValue) {
                    console.log("The object has been found", objectToSearchThrough[key]);
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


<<<<<<< HEAD
    public static parseMessageToJson = (_messageToParse: string): NetworkCommunication.MessageBase => {
        let parsedMessage: NetworkCommunication.MessageBase = { messageType: MESSAGE_TYPE.UNDEFINED };
=======
    public parseMessageToJson(_messageToParse: string): NetworkMessages.MessageBase {
        let parsedMessage: NetworkMessages.MessageBase = { messageType: MESSAGE_TYPE.UNDEFINED };
>>>>>>> master

        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    public static sendTo= (_connection: WebSocket, _message: Object) => {
        _connection.send(JSON.stringify(_message));
    }

    public static initializeServer = () => {
        ServerMain.websocketServer = new WebSocket.Server({ port: 8080 });
        ServerMain.serverEventHandler();
    }
}

const defaultServer = ServerMain.initializeServer();
