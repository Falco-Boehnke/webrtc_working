"use strict";
System.register("DataCollectors/UiElementHandler", [], function (exports_1, context_1) {
    "use strict";
    var UiElementHandler;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            UiElementHandler = class UiElementHandler {
                static getAllUiElements() {
                    UiElementHandler.signalingUrl = document.getElementById("signaling_uri");
                    UiElementHandler.signalingSubmit = document.getElementById("submit_button");
                    UiElementHandler.loginNameInput = document.getElementById("login_name");
                    UiElementHandler.loginButton = document.getElementById("login_button");
                    console.log("UI ELEMENT HANDLER LOGIC: ", UiElementHandler.loginButton);
                    UiElementHandler.msgInput = document.getElementById("msgInput");
                    UiElementHandler.chatbox = document.getElementById("chatbox");
                    UiElementHandler.sendMsgButton = document.getElementById("sendMessage");
                    UiElementHandler.connectToUserButton = document.getElementById("userConnect");
                    UiElementHandler.usernameToConnectTo = document.getElementById("connectToUsername");
                    UiElementHandler.disconnectButton = document.getElementById("disconnectBtn");
                }
            };
            exports_1("UiElementHandler", UiElementHandler);
        }
    };
});
System.register("NetworkConnectionManager", ["DataCollectors/UiElementHandler"], function (exports_2, context_2) {
    "use strict";
    var UiElementHandler_1, NetworkConnectionManager;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (UiElementHandler_1_1) {
                UiElementHandler_1 = UiElementHandler_1_1;
            }
        ],
        execute: function () {
            NetworkConnectionManager = class NetworkConnectionManager {
                constructor() {
                    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
                    //     var configuration = { iceServers: [{
                    //         urls: "stun:stun.services.mozilla.com",
                    //         username: "louis@mozilla.com",
                    //         credential: "webrtcdemo"
                    //     }, {
                    //         urls: ["stun:stun.example.com", "stun:stun-1.example.com"]
                    //     }]
                    // };
                    this.configuration = {
                        iceServers: [
                            { urls: "stun:stun2.1.google.com:19302" },
                            { urls: "stun:stun.example.com" },
                        ],
                    };
                    this.addUiListeners = () => {
                        UiElementHandler_1.UiElementHandler.getAllUiElements();
                        console.log(UiElementHandler_1.UiElementHandler.loginButton);
                        UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", this.loginLogic);
                        UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", this.connectToUser);
                        UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", this.sendMessageToUser);
                    };
                    this.addWsEventListeners = () => {
                        this.ws.addEventListener("open", () => {
                            console.log("Connected to the signaling server");
                        });
                        this.ws.addEventListener("error", (err) => {
                            console.error(err);
                        });
                        this.ws.addEventListener("message", (msg) => {
                            console.log("Got message", msg.data);
                            const data = JSON.parse(msg.data);
                            switch (data.type) {
                                case "login":
                                    this.handleLogin(data.success);
                                    break;
                                case "offer":
                                    this.handleOffer(data.offer, data.username);
                                    break;
                                case "answer":
                                    this.handleAnswer(data.answer);
                                    break;
                                case "candidate":
                                    this.handleCandidate(data.candidate);
                                    break;
                            }
                        });
                    };
                    this.handleCandidate = (_candidate) => {
                        this.connection.addIceCandidate(new RTCIceCandidate(_candidate));
                    };
                    this.handleAnswer = (_answer) => {
                        this.connection.setRemoteDescription(new RTCSessionDescription(_answer));
                    };
                    this.handleOffer = (_offer, _username) => {
                        this.otherUsername = _username;
                        this.connection.setRemoteDescription(new RTCSessionDescription(_offer));
                        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
                        this.connection.createAnswer()
                            .then((answer) => {
                            return this.connection.setLocalDescription(answer);
                        }).then(() => {
                            const answerMessage = new NetworkMessages.RtcAnswer(this.otherUsername, this.connection.localDescription);
                            this.sendMessage(answerMessage);
                        })
                            .catch(() => {
                            console.error("Answer creation failed.");
                        });
                        // this.connection.createAnswer(undefined);
                        // this.connection.createAnswer(
                        //     (answer: RTCSessionDescriptionInit) => {
                        //         this.connection.setLocalDescription(answer);
                        //         const answerMessage = new MessageAnswer(this.otherUsername, answer);
                        //         this.sendMessage(answerMessage);
                        //     },
                        // ).then () => {
                        //     alert("Error when creating an answer");
                        //     console.error(error);
                        // };
                    };
                    this.handleLogin = (_loginSuccess) => {
                        if (_loginSuccess) {
                            console.log("Login succesfully done");
                            this.createRTCConnection();
                            console.log("COnnection at Login: ", this.connection);
                        }
                        else {
                            console.log("Login failed, username taken");
                        }
                    };
                    this.loginLogic = () => {
                        if (UiElementHandler_1.UiElementHandler.loginNameInput != null) {
                            this.username = UiElementHandler_1.UiElementHandler.loginNameInput.value;
                        }
                        else {
                            console.error("UI element missing: Loginname Input field");
                        }
                        console.log(this.username);
                        if (this.username.length <= 0) {
                            console.log("Please enter username");
                            return;
                        }
                        const loginMessage = new NetworkMessages.LoginRequest(this.username);
                        console.log(loginMessage);
                        this.sendMessage(loginMessage);
                    };
                    this.createRTCConnection = () => {
                        this.connection = new RTCPeerConnection(this.configuration);
                        this.peerConnection = this.connection.createDataChannel("testChannel");
                        this.connection.ondatachannel = (datachannelEvent) => {
                            console.log("Data channel is created!");
                            datachannelEvent.channel.addEventListener("open", () => {
                                console.log("Data channel is open and ready to be used.");
                            });
                            datachannelEvent.channel.addEventListener("message", (messageEvent) => {
                                console.log("Received message: " + messageEvent.data);
                                UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.otherUsername + ": " + messageEvent.data;
                            });
                        };
                        this.peerConnection.onmessage = (event) => {
                            console.log("Received message from other peer:", event.data);
                            UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "<br>" + event.data;
                        };
                        this.connection.onicecandidate = (event) => {
                            if (event.candidate) {
                                const candidateMessage = new NetworkMessages.IceCandidate(this.otherUsername, event.candidate);
                                this.sendMessage(candidateMessage);
                            }
                        };
                    };
                    this.connectToUser = () => {
                        // const callUsernameElement =  document.querySelector("input#username-to-call") as HTMLInputElement;
                        // const callToUsername = callUsernameElement.value;
                        const callToUsername = UiElementHandler_1.UiElementHandler.usernameToConnectTo.value;
                        if (callToUsername.length === 0) {
                            alert("Enter a username 😉");
                            return;
                        }
                        this.otherUsername = callToUsername;
                        this.createRtcOffer(this.otherUsername);
                    };
                    this.createRtcOffer = (_userNameForOffer) => {
                        this.connection.createOffer().then((offer) => {
                            return this.connection.setLocalDescription(offer);
                        }).then(() => {
                            const offerMessage = new NetworkMessages.RtcOffer(_userNameForOffer, this.connection.localDescription);
                            this.sendMessage(offerMessage);
                        })
                            .catch(() => {
                            console.error("Offer creation error");
                        });
                        // this.connection.createOffer(
                        //     (offer: RTCSessionDescriptionInit) => {
                        //         const offerMessage = new MessageOffer(userNameForOffer, offer);
                        //         this.connection.setLocalDescription(offer);
                        //         this.sendMessage(offerMessage);
                        //     },
                        //     (error) => {
                        //         alert("Error when creating an offer");
                        //         console.error(error);
                        //     },
                        // );
                    };
                    this.sendMessage = (message) => {
                        this.ws.send(JSON.stringify(message));
                    };
                    this.sendMessageToUser = () => {
                        // const messageField =  document.getElementById("msgInput") as HTMLInputElement;
                        // const message = messageField.value;
                        const message = UiElementHandler_1.UiElementHandler.msgInput.value;
                        UiElementHandler_1.UiElementHandler.chatbox.innerHTML += "\n" + this.username + ": " + message;
                        if (this.peerConnection != undefined) {
                            this.peerConnection.send(message);
                        }
                    };
                    this.ws = new WebSocket("ws://localhost:8080");
                    this.username = "";
                    this.connection = new RTCPeerConnection();
                    this.otherUsername = "";
                    this.peerConnection = undefined;
                    UiElementHandler_1.UiElementHandler.getAllUiElements();
                    this.addUiListeners();
                    this.addWsEventListeners();
                }
            };
            exports_2("NetworkConnectionManager", NetworkConnectionManager);
        }
    };
});
const electron = require("electron");
const { app, BrowserWindow } = require("electron");
// Behalten Sie eine globale Referenz auf das Fensterobjekt.
// Wenn Sie dies nicht tun, wird das Fenster automatisch geschlossen,
// sobald das Objekt dem JavaScript-Garbagekollektor übergeben wird.
let win;
function createWindow() {
    // Node integration must be true, otherwise shit don't work because
    // require is not possible
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        },
    });
    if (win === null) {
        return;
    }
    // und Laden der index.html der App.
    win.loadFile("index.html");
    // Öffnen der DevTools.
    win.webContents.openDevTools();
    // Ausgegeben, wenn das Fenster geschlossen wird.
    win.on("closed", () => {
        // Dereferenzieren des Fensterobjekts, normalerweise würden Sie Fenster
        // in einem Array speichern, falls Ihre App mehrere Fenster unterstützt.
        // Das ist der Zeitpunkt, an dem Sie das zugehörige Element löschen sollten.
        win = null;
    });
}
// Diese Methode wird aufgerufen, wenn Electron mit der
// Initialisierung fertig ist und Browserfenster erschaffen kann.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.on("ready", createWindow);
// Verlassen, wenn alle Fenster geschlossen sind.
app.on("window-all-closed", () => {
    // Unter macOS ist es üblich, für Apps und ihre Menu Bar
    // aktiv zu bleiben, bis der Nutzer explizit mit Cmd + Q die App beendet.
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
    // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
    if (win === null) {
        createWindow();
    }
});
// In dieser Datei können Sie den Rest des App-spezifischen
// Hauptprozess-Codes einbinden. Sie können den Code auch
// auf mehrere Dateien aufteilen und diese hier einbinden.
System.register("renderer", ["NetworkConnectionManager", "DataCollectors/UiElementHandler"], function (exports_3, context_3) {
    "use strict";
    var NetworkConnectionManager_1, UiElementHandler_2, test;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (NetworkConnectionManager_1_1) {
                NetworkConnectionManager_1 = NetworkConnectionManager_1_1;
            },
            function (UiElementHandler_2_1) {
                UiElementHandler_2 = UiElementHandler_2_1;
            }
        ],
        execute: function () {
            UiElementHandler_2.UiElementHandler.getAllUiElements();
            console.log(document.getElementById("loginButton"));
            test = new NetworkConnectionManager_1.NetworkConnectionManager();
        }
    };
});
System.register("DataCollectors/ServerRoom", [], function (exports_4, context_4) {
    "use strict";
    var ServerRoom;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            ServerRoom = class ServerRoom {
            };
            exports_4("ServerRoom", ServerRoom);
        }
    };
});
System.register("DataCollectors/Client", [], function (exports_5, context_5) {
    "use strict";
    var Client;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            Client = class Client {
                constructor(websocketConnection, uniqueClientId, loginName, connectedToRoom) {
                    this.clientConnection = websocketConnection || null;
                    this.id = uniqueClientId || "";
                    this.userName = loginName || "";
                    this.connectedRoom = connectedToRoom || null;
                }
            };
            exports_5("Client", Client);
        }
    };
});
var MESSAGE_TYPE;
(function (MESSAGE_TYPE) {
    MESSAGE_TYPE["UNDEFINED"] = "undefined";
    MESSAGE_TYPE["LOGIN"] = "login";
    MESSAGE_TYPE["RTC_OFFER"] = "offer";
    MESSAGE_TYPE["RTC_ANSWER"] = "answer";
    MESSAGE_TYPE["RTC_CANDIDATE"] = "candidate";
})(MESSAGE_TYPE || (MESSAGE_TYPE = {}));
var TEST_ENUM;
(function (TEST_ENUM) {
    TEST_ENUM["SERIOUSLY"] = "wtf";
})(TEST_ENUM || (TEST_ENUM = {}));
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
/// <reference path = "./MessageBase.ts" />
(function (NetworkMessages) {
    class IceCandidate {
        constructor(_userNameToConnectTo, _candidate) {
            this.messageType = MESSAGE_TYPE.RTC_CANDIDATE;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.candidate = _candidate;
        }
    }
    NetworkMessages.IceCandidate = IceCandidate;
})(NetworkMessages || (NetworkMessages = {}));
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
/// <reference path = "./MessageBase.ts" />
(function (NetworkMessages) {
    class LoginRequest {
        constructor(_loginUserName) {
            this.messageType = MESSAGE_TYPE.LOGIN;
            this.loginUserName = "";
            this.loginUserName = _loginUserName;
        }
    }
    NetworkMessages.LoginRequest = LoginRequest;
})(NetworkMessages || (NetworkMessages = {}));
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
/// <reference path = "./MessageBase.ts" />
(function (NetworkMessages) {
    class RtcAnswer {
        constructor(_userNameToConnectTo, _answer) {
            this.messageType = MESSAGE_TYPE.RTC_ANSWER;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.answer = _answer;
        }
    }
    NetworkMessages.RtcAnswer = RtcAnswer;
})(NetworkMessages || (NetworkMessages = {}));
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
/// <reference path = "./MessageBase.ts" />
(function (NetworkMessages) {
    class RtcOffer {
        constructor(_userNameToConnectTo, _offer) {
            this.messageType = MESSAGE_TYPE.RTC_OFFER;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.offer = _offer;
        }
    }
    NetworkMessages.RtcOffer = RtcOffer;
})(NetworkMessages || (NetworkMessages = {}));
System.register("Server/ServerMain", ["ws", "DataCollectors/Client"], function (exports_6, context_6) {
    "use strict";
    var WebSocket, Client_1, ServerMain, defaultServer;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (WebSocket_1) {
                WebSocket = WebSocket_1;
            },
            function (Client_1_1) {
                Client_1 = Client_1_1;
            }
        ],
        execute: function () {
            // import { MessageAnswer } from "../NetworkMessages/MessageAnswer";
            // import { MESSAGE_TYPE as MESSAGE_TYPE, MessageBase } from "../NetworkMessages/MessageBase";
            // import { MessageCandidate } from "../NetworkMessages/MessageCandidate";
            // import { MessageLoginRequest } from "../NetworkMessages/MessageLoginRequest";
            // import { MessageOffer } from "../NetworkMessages/MessageOffer";
            ServerMain = class ServerMain {
                constructor() {
                    this.users = {};
                    this.usersCollection = new Array();
                    // TODO PArameter mit Unterstrich
                    // TODO Coding guidelines umsetzen
                    // handle closing
                    this.serverEventHandler = () => {
                        this.websocketServer.on("connection", (_websocketClient) => {
                            // _websocketClient = _websocketClient;
                            console.log("User connected FRESH");
                            const uniqueIdOnConnection = this.createID();
                            const freshlyConnectedClient = new Client_1.Client(_websocketClient, uniqueIdOnConnection);
                            this.usersCollection.push(freshlyConnectedClient);
                            console.log("User connected FRESH");
                            _websocketClient.on("message", this.serverHandleMessageType);
                            _websocketClient.addEventListener("close", () => {
                                console.error("Error at connection");
                            });
                        });
                    };
                    this.createID = () => {
                        // Math.random should be random enough because of it's seed
                        // convert to base 36 and pick the first few digits after comma
                        return "_" + Math.random().toString(36).substr(2, 7);
                    };
                    this.websocketServer = new WebSocket.Server({ port: 8080 });
                    this.serverEventHandler();
                }
                // TODO Check if event.type can be used for identification instead
                serverHandleMessageType(_message) {
                    let parsedMessage = null;
                    console.log(_message);
                    try {
                        parsedMessage = JSON.parse(_message);
                    }
                    catch (error) {
                        console.error("Invalid JSON", error);
                    }
                    const messageData = parsedMessage;
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
                //#region MessageHandler
                serverHandleLogin(_websocketConnection, _messageData) {
                    console.log("User logged", _messageData.loginUserName);
                    let usernameTaken = true;
                    usernameTaken = this.searchForPropertyValueInCollection(_messageData.loginUserName, "userName", this.usersCollection) != null;
                    if (!usernameTaken) {
                        const associatedWebsocketConnectionClient = this.searchForPropertyValueInCollection(_websocketConnection, "clientConnection", this.usersCollection);
                        if (associatedWebsocketConnectionClient != null) {
                            associatedWebsocketConnectionClient.userName = _messageData.loginUserName;
                            console.log("Changed name of client object");
                            this.sendTo(_websocketConnection, {
                                type: "login",
                                success: true,
                                id: associatedWebsocketConnectionClient.id,
                            });
                        }
                    }
                    else {
                        this.sendTo(_websocketConnection, { type: "login", success: false });
                        usernameTaken = true;
                        console.log("UsernameTaken");
                    }
                }
                serverHandleRTCOffer(_messageData) {
                    console.log("Sending offer to: ", _messageData.userNameToConnectTo);
                    const requestedClient = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);
                    if (requestedClient != null) {
                        console.log("User for offer found", requestedClient);
                        requestedClient.clientConnection.otherUsername = _messageData.userNameToConnectTo;
                        const offerMessage = new NetworkMessages.RtcOffer(requestedClient.userName, _messageData.offer);
                        this.sendTo(requestedClient.clientConnection, offerMessage);
                    }
                    else {
                        console.log("Usernoame to connect to doesn't exist");
                    }
                }
                serverHandleRTCAnswer(_messageData) {
                    console.log("Sending answer to: ", _messageData.userNameToConnectTo);
                    const clientToSendAnswerTo = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);
                    if (clientToSendAnswerTo != null) {
                        clientToSendAnswerTo.clientConnection.otherUsername = clientToSendAnswerTo.userName;
                        const answerToSend = new NetworkMessages.RtcAnswer(clientToSendAnswerTo.userName, _messageData.answer);
                        this.sendTo(clientToSendAnswerTo.clientConnection, answerToSend);
                    }
                }
                serverHandleICECandidate(_messageData) {
                    console.log("Sending candidate to:", _messageData.userNameToConnectTo);
                    const clientToShareCandidatesWith = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.usersCollection);
                    if (clientToShareCandidatesWith != null) {
                        const candidateToSend = new NetworkMessages.IceCandidate(clientToShareCandidatesWith.userName, _messageData.candidate);
                        this.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
                    }
                }
                //#endregion
                //#region Helperfunctions
                // Helper function for searching through a collection, finding objects by key and value, returning
                // Object that has that value
                searchForPropertyValueInCollection(propertyValue, key, collectionToSearch) {
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
                //#endregion
                parseMessageToJson(_messageToParse) {
                    let parsedMessage = { messageType: MESSAGE_TYPE.UNDEFINED };
                    try {
                        parsedMessage = JSON.parse(_messageToParse);
                    }
                    catch (error) {
                        console.error("Invalid JSON", error);
                    }
                    return parsedMessage;
                }
                sendTo(_connection, _message) {
                    _connection.send(JSON.stringify(_message));
                }
            };
            defaultServer = new ServerMain();
        }
    };
});
//# sourceMappingURL=Test.js.map