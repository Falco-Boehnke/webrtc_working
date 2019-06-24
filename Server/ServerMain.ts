import * as WebSocket from "ws";
import { Client } from "./../DataCollectors/Client";
import * as NetworkCommunication from "./../NetworkMessages/index";
import { MESSAGE_TYPE } from "./../DataCollectors/Enumerators/EnumeratorCollection";
// import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
// import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
// import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
// import { MessageLoginRequest } from "../NetworkMessages/MessageLoginRequest";
// import { MessageOffer } from "../NetworkMessages/MessageOffer";
class ServerMain {
    public websocketServer: WebSocket.Server;
    public users = {};
    public usersCollection = new Array();

    constructor() {
        this.websocketServer = new WebSocket.Server({ port: 8080 });
        this.serverEventHandler();
    }
    // TODO PArameter mit Unterstrich
    // TODO Coding guidelines umsetzen

    // handle closing

    public serverEventHandler = (): void => {
        this.websocketServer.on("connection", (_websocketClient: any) => {
            // _websocketClient = _websocketClient;
            console.log("User connected FRESH");

            const uniqueIdOnConnection = this.createID();
            const freshlyConnectedClient = new Client(_websocketClient, uniqueIdOnConnection);
            this.usersCollection.push(freshlyConnectedClient);

            console.log("User connected FRESH");
            _websocketClient.on("message", this.serverHandleMessageType);

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
            });

        });
    }

    // TODO Check if event.type can be used for identification instead
    public serverHandleMessageType(_message: string): void {
        let parsedMessage: NetworkCommunication.MessageBase | null = null;
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
                case MESSAGE_TYPE.LOGIN:
                    this.serverHandleLogin(messageData.target, messageData);
                    break;

                case MESSAGE_TYPE.RTC_OFFER:
                    this.serverHandleRTCOffer(messageData);
                    break;

                case MESSAGE_TYPE.RTC_ANSWER:
                    this.serverHandleRTCAnswer(messageData);
                    break;

                case MESSAGE_TYPE.RTC_CANDIDATE:
                    this.serverHandleICECandidate(messageData);
                    break;

                default:
                    console.log("Message type not recognized");
                    break;

            }
        }
    }


    public serverHandleLogin = (_websocketConnection: WebSocket, _messageData: NetworkCommunication.MessageLoginRequest) => {
        console.log("User logged", _messageData.loginUserName);
        let usernameTaken: boolean = true;
        usernameTaken = this.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", this.usersCollection) != null;

        if (!usernameTaken) {
            const associatedWebsocketConnectionClient =
                this.searchForPropertyValueInCollection
                    (_websocketConnection,
                        "clientConnection",
                        this.usersCollection);

            if (associatedWebsocketConnectionClient != null) {
                associatedWebsocketConnectionClient.userName = _messageData.loginUserName;
                console.log("Changed name of client object");

                this.sendTo(_websocketConnection,
                    {
                        type: "login",
                        success: true,
                        id: associatedWebsocketConnectionClient.id,
                    },
                );
            }
        } else {
            this.sendTo(_websocketConnection, { type: "login", success: false });
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }

    public serverHandleRTCOffer(_messageData: NetworkCommunication.MessageOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);

        if (requestedClient != null) {
            console.log("User for offer found", requestedClient);
            requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
            const offerMessage = new NetworkCommunication.MessageOffer(requestedClient.userName, _messageData.offer);
            this.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.log("Usernoame to connect to doesn't exist"); }
    }

    public serverHandleRTCAnswer(_messageData: NetworkCommunication.MessageAnswer): void {
        console.log("Sending answer to: ", _messageData.userNameToConnectTo);

        const clientToSendAnswerTo = this.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
                "userName",
                this.usersCollection);

        if (clientToSendAnswerTo != null) {
            clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
            const answerToSend = new NetworkCommunication.MessageAnswer(clientToSendAnswerTo.userName, _messageData.answer);
            this.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
        }
    }

    public serverHandleICECandidate(_messageData: NetworkCommunication.MessageCandidate): void {
        console.log("Sending candidate to:", _messageData.userNameToConnectTo);
        const clientToShareCandidatesWith = this.searchForPropertyValueInCollection
            (_messageData.userNameToConnectTo,
                "userName",
                this.usersCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend = new NetworkCommunication.MessageCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
            this.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }


    //#region Helperfunctions

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    public searchForPropertyValueInCollection(propertyValue: any, key: string, collectionToSearch: any[]) {
        for (const propertyObject in collectionToSearch) {
            if (this.usersCollection.hasOwnProperty(propertyObject)) {
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }

    public createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }
    //#endregion


    public parseMessageToJson(_messageToParse: string): NetworkCommunication.MessageBase {
        let parsedMessage: NetworkCommunication.MessageBase = { messageType: MESSAGE_TYPE.UNDEFINED };

        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    public sendTo(_connection: WebSocket, _message: Object) {
        _connection.send(JSON.stringify(_message));
    }
}
const defaultServer = new ServerMain();
