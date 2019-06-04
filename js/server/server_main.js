"use strict";
exports.__esModule = true;
var Message_Base_1 = require("../../NetworkMessages/Message_Base");
var Websocket = require("ws");
var websocketServer = new Websocket.Server({ port: 8080 });
var users = {};
websocketServer.on("connection", function (websocketToClient) {
    console.log("User connected FRESH");
    websocketToClient.on("message", function (message) {
        var data = null;
        try {
            data = JSON.parse(message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
            data = {};
        }
        switch (data.messageType) {
            case Message_Base_1.MessageType.LOGIN:
                console.log("User logged", data.loginUserName);
                if (users[data.loginUserName]) {
                    sendTo(websocketToClient, { type: "login", success: false });
                }
                else {
                    users[data.loginUserName] = websocketToClient;
                    websocketToClient.username = data.loginUserName;
                    sendTo(websocketToClient, { type: "login", success: true });
                }
                break;
            case Message_Base_1.MessageType.RTC_OFFER:
                console.log("Sending offer to: ", data.userNameToConnectTo);
                if (users[data.userNameToConnectTo] != null) {
                    websocketToClient.otherUsername = data.userNameToConnectTo;
                    sendTo(users[data.userNameToConnectTo], {
                        type: "offer",
                        offer: data.offer,
                        username: websocketToClient.username
                    });
                }
                else {
                    console.log("Username to connect to doesn't exist");
                }
                break;
            case Message_Base_1.MessageType.RTC_ANSWER:
                console.log("Sending answer to: ", data.userNameToConnectTo);
                if (users[data.userNameToConnectTo] != null) {
                    websocketToClient.otherUsername = data.userNameToConnectTo;
                    sendTo(users[data.userNameToConnectTo], {
                        type: "answer",
                        answer: data.answer
                    });
                }
                break;
            case Message_Base_1.MessageType.RTC_CANDIDATE:
                console.log("Sending candidate to:", data.userNameToConnectTo);
                if (users[data.userNameToConnectTo] != null) {
                    sendTo(users[data.userNameToConnectTo], {
                        type: "candidate",
                        candidate: data.candidate
                    });
                }
                break;
            default:
                console.log("Message type not recognized");
                break;
        }
    });
    websocketToClient.on("close", function () {
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
