import { MessageType } from "../NetworkMessages/Message_Base";
import * as WebSocket from 'ws';

const websocketServer: WebSocket.Server = new WebSocket.Server({ port: 8080 });
const users = {};

let _websocketToClient: WebSocket;
//TODO PArameter mit Unterstrich
//TODO Coding guidelines umsetzen
websocketServer.on("connection", (_websocketClient: WebSocket) => {
    _websocketToClient = _websocketClient;
    console.log("User connected FRESH");
    _websocketToClient.addEventListener("message", (_message: MessageEvent) => {
        
        let messageData = parseMessageToJson(_message)

        switch (messageData.MessageType) {
            case MessageType.LOGIN:
                serverHandleLogin(messageData);
                break;

            case MessageType.RTC_OFFER:
                serverHandleRTCOffer(messageData);
                break;

            case MessageType.RTC_ANSWER:
                serverHandleRTCAnswer(messageData);
                break;

            case MessageType.RTC_CANDIDATE:
                serverHandleICECandidate(messageData);
                break;

            default:
                console.log("Message type not recognized");
                break;

        }
    });

    _websocketToClient.addEventListener("close", () => {
        // handle closing
    });
});

function serverHandleLogin(_messageData): void
{
    console.log("User logged", _messageData.loginUserName);
    if (users[_messageData.loginUserName]) {
        sendTo(_websocketToClient, { type: "login", success: false });
    } else {
        users[_messageData.loginUserName] = _websocketToClient;
        _websocketToClient.username = _messageData.loginUserName;
        sendTo(_websocketToClient, { type: "login", success: true });
    }
}

function serverHandleRTCOffer(_messageData): void
{
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

function serverHandleRTCAnswer(_messageData): void
{
    console.log("Sending answer to: ", _messageData.userNameToConnectTo);
    if (users[_messageData.userNameToConnectTo] != null) {
        _websocketToClient.otherUsername = _messageData.userNameToConnectTo;
        sendTo(users[_messageData.userNameToConnectTo], {
            type: "answer",
            answer: _messageData.answer,
        });
    }
}

function serverHandleICECandidate(_messageData): void
{
    console.log("Sending candidate to:", _messageData.userNameToConnectTo);

    if (users[_messageData.userNameToConnectTo] != null) {
        sendTo(users[_messageData.userNameToConnectTo], {
            type: "candidate",
            candidate: _messageData.candidate,
        });
    }
}
function parseMessageToJson(_messageToParse: MessageEvent)
{
    let parsedMessage = {};

        try {
            parsedMessage = JSON.parse(_messageToParse.data);
        } catch (error) {
            console.error("Invalid JSON", error);
            parsedMessage = {};
        }
    return parsedMessage;
}

function sendTo(_connection: WebSocket, _message: Object) {
    _connection.send(JSON.stringify(_message));
}
// const handleLogin = (data) => {
//     if (users[data.username]) {
//         sendTo(_websocketToClient, { type: 'login', success: false })
//     }
//     else {
//         users
//     }
// }

