import * as WebSocket from "ws";
import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
import { MessageOffer } from "../NetworkMessages/MessageOffer";
import { MessageLoginRequest } from "../test2-win32-x64/resources/app/NetworkMessages/MessageLoginRequest";

const websocketServer: WebSocket.Server = new WebSocket.Server({ port: 8080 });
const users = {};

let _websocketToClient: WebSocket;
// TODO PArameter mit Unterstrich
// TODO Coding guidelines umsetzen
websocketServer.on("connection", (_websocketClient: WebSocket) => {
    _websocketToClient = _websocketClient;

    console.log("User connected FRESH");
    _websocketToClient.on("message", serverHandleMessageType);

    _websocketToClient.addEventListener("close", () => {
        // handle closing
    });
});

// TODO Check if event.type can be used for identification instead
function serverHandleMessageType(_event: { data: string; type: string; target: WebSocket }): void {

    const messageData: MessageBase  = parseMessageToJson(_event.data);

    switch (messageData.messageType) {
        // TODO Enums ALLCAPS_ENUM
        case MESSAGE_TYPE.LOGIN:
            serverHandleLogin(messageData);
            break;

        case MESSAGE_TYPE.RTC_OFFER:
            serverHandleRTCOffer(messageData);
            break;

        case MESSAGE_TYPE.RTC_ANSWER:
            serverHandleRTCAnswer(messageData);
            break;

        case MESSAGE_TYPE.RTC_CANDIDATE:
            serverHandleICECandidate(messageData);
            break;

        default:
            console.log("Message type not recognized");
            break;

    }
}

//#region MessageHandler
function serverHandleLogin(_messageData: MessageLoginRequest): void {
    console.log("User logged", _messageData.loginUserName);
    if (users[_messageData.loginUserName]) {
        sendTo(_websocketToClient, { type: "login", success: false });
    } else {
        users[_messageData.loginUserName] = _websocketToClient;
        _websocketToClient.username = _messageData.loginUserName;
        sendTo(_websocketToClient, { type: "login", success: true });
    }
}

function serverHandleRTCOffer(_messageData: MessageOffer): void {
    console.log("Sending offer to: ", _messageData.userNameToConnectTo);
    if (users[_messageData.userNameToConnectTo] != null) {
        _websocketToClient.otherUsername = _messageData.userNameToConnectTo;
        sendTo(users[_messageData.userNameToConnectTo], {
            type: "offer",
            offer: _messageData.offer,
            username: _websocketToClient.username,
        });
    } else {
        console.log("Username to connect to doesn't exist");
    }
}

function serverHandleRTCAnswer(_messageData: MessageAnswer): void {
    console.log("Sending answer to: ", _messageData.userNameToConnectTo);
    if (users[_messageData.userNameToConnectTo] != null) {
        _websocketToClient.otherUsername = _messageData.userNameToConnectTo;
        sendTo(users[_messageData.userNameToConnectTo], {
            type: "answer",
            answer: _messageData.answer,
        });
    }
}

function serverHandleICECandidate(_messageData: MessageCandidate): void {
    console.log("Sending candidate to:", _messageData.userNameToConnectTo);

    if (users[_messageData.userNameToConnectTo] != null) {
        sendTo(users[_messageData.userNameToConnectTo], {
            type: "candidate",
            candidate: _messageData.candidate,
        });
    }
}
//#endregion

function parseMessageToJson(_messageToParse: string): MessageBase {
    let parsedMessage: MessageBase = {messageType: MESSAGE_TYPE.UNDEFINED};

    try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
    return parsedMessage;
}

function sendTo(_connection: WebSocket, _message: Object) {
    _connection.send(JSON.stringify(_message));
}
