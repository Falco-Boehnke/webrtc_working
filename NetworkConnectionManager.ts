import { stringify } from "querystring";
import { MessageAnswer } from "./NetworkMessages/MessageAnswer";
import { MessageCandidate } from "./NetworkMessages/MessageCandidate";
import { MessageLoginRequest } from "./NetworkMessages/MessageLoginRequest";
import { MessageOffer } from "./NetworkMessages/MessageOffer";
import { UiElementHandler } from "./UiElementHandler";

export class NetworkConnectionManager {
    public ws: WebSocket;
    public username: string;
    public connection: RTCPeerConnection;
    public otherUsername: string;
    public peerConnection: RTCDataChannel;
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    //     var configuration = { iceServers: [{
    //         urls: "stun:stun.services.mozilla.com",
    //         username: "louis@mozilla.com", 
    //         credential: "webrtcdemo"
    //     }, {
    //         urls: ["stun:stun.example.com", "stun:stun-1.example.com"]
    //     }]
    // };

    public configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" },
        ],
    };

    constructor() {
        this.ws = new WebSocket("ws://localhost:8080");
        this.username = "";
        this.connection = new RTCPeerConnection();
        this.otherUsername = "";
        this.peerConnection = new RTCDataChannel();

        this.addUiListeners();
        this.addWsEventListeners();
    }

    public addUiListeners = (): void => {
        UiElementHandler.login_button.addEventListener("click", this.loginLogic);
        UiElementHandler.connectToUserButton.addEventListener("click", this.connectToUser);
        UiElementHandler.sendMsgButton.addEventListener("click", this.sendMessageToUser);
    }
    public addWsEventListeners = (): void => {
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
    }

    public handleCandidate = (candidate: RTCIceCandidateInit | undefined) => {
        this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    public handleAnswer = (answer: RTCSessionDescriptionInit) => {
        this.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    public handleOffer = (offer: RTCSessionDescriptionInit, username: string): void => {
        this.otherUsername = username;
        this.connection.setRemoteDescription(new RTCSessionDescription(offer));

        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        this.connection.createAnswer()
            .then((answer) => {
                return this.connection.setLocalDescription(answer);
            }).then(() => {
                const answerMessage = new MessageAnswer(this.otherUsername, this.connection.localDescription);
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
    }

    public handleLogin = (loginSuccess: boolean): void => {
        if (loginSuccess) {
            console.log("Login succesfully done");
            this.createRTCConnection();
            console.log("COnnection at Login: ", this.connection);
        } else {
            console.log("Login failed, username taken");
        }
    }

    public loginLogic = (): void => {
        this.username = UiElementHandler.login_nameInput.value;
        console.log(this.username);
        if (this.username.length < 0) {
            console.log("Please enter username");
            return;
        }
        const loginMessage = new MessageLoginRequest(this.username);

        this.sendMessage(loginMessage);
    }

    public createRTCConnection = () => {
        this.connection = new RTCPeerConnection(this.configuration);

        this.peerConnection = this.connection.createDataChannel("testChannel");

        this.connection.ondatachannel = (datachannelEvent) => {
            console.log("Data channel is created!");

            datachannelEvent.channel.addEventListener("open", () => {
                console.log("Data channel is open and ready to be used.");
            });
            datachannelEvent.channel.addEventListener("message", (messageEvent) => {
                console.log("Received message: " + messageEvent.data);
                UiElementHandler.chatbox.innerHTML += "\n" + this.otherUsername + ": " + messageEvent.data;
            });
        };

        this.peerConnection.onmessage = (event) => {
            console.log("Received message from other peer:", event.data);
            UiElementHandler.chatbox.innerHTML += "<br>" + event.data;
        };

        this.connection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidateMessage = new MessageCandidate(this.otherUsername, event.candidate);
                this.sendMessage(candidateMessage);
            }
        };
    }

    public connectToUser = (): void => {

        // const callUsernameElement =  document.querySelector("input#username-to-call") as HTMLInputElement;
        // const callToUsername = callUsernameElement.value;
        const callToUsername = UiElementHandler.usernameToConnectTo.value;
        if (callToUsername.length === 0) {
            alert("Enter a username 😉");
            return;
        }

        this.otherUsername = callToUsername;
        this.createRtcOffer(this.otherUsername);

    }

    public createRtcOffer = (userNameForOffer: string): void => {

        this.connection.createOffer().then((offer) => {
            return this.connection.setLocalDescription(offer);
        }).then(() => {
            const offerMessage = new MessageOffer(userNameForOffer, this.connection.localDescription);
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
    }

    public sendMessage = (message: Object) => {
        this.ws.send(JSON.stringify(message));
    }

    public sendMessageToUser = () => {
        // const messageField =  document.getElementById("msgInput") as HTMLInputElement;
        // const message = messageField.value;
        const message = UiElementHandler.msgInput.value;
        UiElementHandler.chatbox.innerHTML += "\n" + this.username + ": " + message;
        this.peerConnection.send(message);
    }

}
