///<reference path="DataCollectors/Enumerators/EnumeratorCollection.ts"/>
///<reference path="NetworkMessages/IceCandidate.ts"/>
///<reference path="NetworkMessages/LoginRequest.ts"/>
///<reference path="NetworkMessages/MessageBase.ts"/>
///<reference path="NetworkMessages/RtcAnswer.ts"/>
///<reference path="NetworkMessages/RtcOffer.ts"/>
import { UiElementHandler } from "./DataCollectors/UiElementHandler";
// tslint:disable-next-line: no-any
declare var NetworkMessages: any;
export class NetworkConnectionManager {
    public ws: WebSocket;
    public username: string;
    public connection: RTCPeerConnection;
    public otherUsername: string;
    public peerConnection: RTCDataChannel | undefined;
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
        this.peerConnection = undefined;
        UiElementHandler.getAllUiElements();
        this.addUiListeners();
        this.addWsEventListeners();
    }

    public addUiListeners = (): void => {
        UiElementHandler.getAllUiElements();
        console.log(UiElementHandler.loginButton);
        UiElementHandler.loginButton.addEventListener("click", this.loginLogic);
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
                    this.loginValidAddUser(data.success);
                    break;
                case "offer":
                    this.setDescriptionOnOfferAndSendAnswer(data.offer, data.username);
                    break;
                case "answer":
                    this.setDescriptionAsAnswer(data.answer);
                    break;
                case "candidate":
                    this.handleCandidate(data.candidate);
                    break;
            }
        });
    }

    public handleCandidate = (_candidate: RTCIceCandidateInit | undefined) => {
        this.connection.addIceCandidate(new RTCIceCandidate(_candidate));
    }

    public setDescriptionAsAnswer = (_answer: RTCSessionDescriptionInit) => {
        this.connection.setRemoteDescription(new RTCSessionDescription(_answer));
    }

    public setDescriptionOnOfferAndSendAnswer = (_offer: RTCSessionDescriptionInit, _username: string): void => {
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
    }

    public loginValidAddUser = (_loginSuccess: boolean): void => {
        if (_loginSuccess) {
            console.log("Login succesfully done");
            this.createRTCConnection();
            console.log("COnnection at Login: ", this.connection);
        } else {
            console.log("Login failed, username taken");
        }
    }

    public loginLogic = (): void => {
        if (UiElementHandler.loginNameInput != null) {
            this.username = UiElementHandler.loginNameInput.value;
        }
        else { console.error("UI element missing: Loginname Input field"); }
        console.log(this.username);
        if (this.username.length <= 0) {
            console.log("Please enter username");
            return;
        }
        const loginMessage: NetworkMessages.LoginRequest = new NetworkMessages.LoginRequest(this.username);
        console.log(loginMessage);
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
                const candidateMessage = new NetworkMessages.IceCandidate(this.otherUsername, event.candidate);
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

    public createRtcOffer = (_userNameForOffer: string): void => {

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
    }

    public sendMessage = (message: Object) => {
        this.ws.send(JSON.stringify(message));
    }

    public sendMessageToUser = () => {
        // const messageField =  document.getElementById("msgInput") as HTMLInputElement;
        // const message = messageField.value;
        const message = UiElementHandler.msgInput.value;
        UiElementHandler.chatbox.innerHTML += "\n" + this.username + ": " + message;
        if (this.peerConnection) {
            this.peerConnection.send(message);
        }
        else {
            console.error("Peer Connection undefined, connection likely lost");
        }
    }

}
