import { MessageType } from "../../NetworkMessages/Message_Base";
const Websocket = require("ws");

const websocketServer = new Websocket.Server({ port: 8080 });
const users = {};

websocketServer.on("connection", (websocketToClient: WebSocket) => {
    console.log("User connected FRESH");

    websocketToClient.on("message", (message) => {
        let data = null;

        try {
            data = JSON.parse(message);
        } catch (error) {
            console.error("Invalid JSON", error);
            data = {};
        }

        switch (data.messageType) {
            case MessageType.LOGIN:
                console.log("User logged", data.loginUserName);
                if (users[data.loginUserName]) {
                    sendTo(websocketToClient, { type: "login", success: false });
                } else {
                    users[data.loginUserName] = websocketToClient;
                    websocketToClient.username = data.loginUserName;
                    sendTo(websocketToClient, { type: "login", success: true });
                }
                break;

            case MessageType.RTC_OFFER:
                console.log("Sending offer to: ", data.userNameToConnectTo);
                if (users[data.userNameToConnectTo] != null) {
                    websocketToClient.otherUsername = data.userNameToConnectTo;
                    sendTo(users[data.userNameToConnectTo], {
                        type: "offer",
                        offer: data.offer,
                        username: websocketToClient.username,
                    });
                } else {
                    console.log("Username to connect to doesn't exist");
                }
                break;

            case MessageType.RTC_ANSWER:
                console.log("Sending answer to: ", data.userNameToConnectTo);
                if (users[data.userNameToConnectTo] != null) {
                    websocketToClient.otherUsername = data.userNameToConnectTo;
                    sendTo(users[data.userNameToConnectTo], {
                        type: "answer",
                        answer: data.answer,
                    });
                }
                break;

            case MessageType.RTC_CANDIDATE:
                console.log("Sending candidate to:", data.userNameToConnectTo);

                if (users[data.userNameToConnectTo] != null) {
                    sendTo(users[data.userNameToConnectTo], {
                        type: "candidate",
                        candidate: data.candidate,
                    });
                }

                break;
            default:
                console.log("Message type not recognized");
                break;

        }
    });

    websocketToClient.on("close", () => {
        // handle closing
    });
});

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}
// const handleLogin = (data) => {
//     if (users[data.username]) {
//         sendTo(websocketToClient, { type: 'login', success: false })
//     }
//     else {
//         users
//     }
// }

