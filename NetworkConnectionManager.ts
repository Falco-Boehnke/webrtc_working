import { UiElementHandler } from "./DataCollectors/UiElementHandler";
import * as TYPES from "./DataCollectors/Enumerators/EnumeratorCollection";
import * as NetworkMessages from "./NetworkMessages";



export class NetworkConnectionManager {
    public ws: WebSocket;
    public localClientId: string;
    public localUserName: string;
    public connection: RTCPeerConnection;
    public remoteConnection: RTCPeerConnection | null;
    public userNameLocalIsConnectedTo: string;
    public peerConnectionToChosenPeer: RTCDataChannel | undefined;

    // tslint:disable-next-line: typedef
    public configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" }
        ]
    };
    private isNegotiating: boolean = false;
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    //     var configuration = { iceServers: [{
    //         urls: "stun:stun.services.mozilla.com",
    //         username: "louis@mozilla.com",
    //         credential: "webrtcdemo"
    //     }, {
    //         urls: ["stun:stun.example.com", "stun:stun-1.example.com"]
    //     }]
    // };

    //#region Class initiation functions
    constructor() {
        this.ws = new WebSocket("ws://localhost:8080");
        this.localUserName = "";
        this.localClientId = "undefined";
        this.connection = new RTCPeerConnection();
        this.remoteConnection = null;
        this.userNameLocalIsConnectedTo = "";
        this.peerConnectionToChosenPeer = undefined;
        UiElementHandler.getAllUiElements();
        this.addUiListeners();
        this.addWsEventListeners();
    }

    public addUiListeners = (): void => {
        UiElementHandler.getAllUiElements();
        console.log(UiElementHandler.loginButton);
        UiElementHandler.loginButton.addEventListener("click", this.checkChosenUsernameAndCreateLoginRequest);
        UiElementHandler.connectToUserButton.addEventListener("click", this.checkUsernameToConnectToAndInitiateConnection);
        UiElementHandler.sendMsgButton.addEventListener("click", this.sendMessageViaDirectPeerConnection);
    }
    public addWsEventListeners = (): void => {
        this.ws.addEventListener("open", (_connOpen: Event) => {
            console.log("Conneced to the signaling server", _connOpen);
        });

        this.ws.addEventListener("error", (_err: Event) => {
            console.error(_err);
        });

        this.ws.addEventListener("message", (_receivedMessage: MessageEvent) => {
            this.parseMessageAndCallCorrespondingMessageHandler(_receivedMessage);
        });
    }

    //#endregion
    
    public parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage: MessageEvent) => {
        // tslint:disable-next-line: typedef
        let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);

        switch (objectifiedMessage.messageType) {
            case TYPES.MESSAGE_TYPE.LOGIN_RESPONSE:
                console.log("LOGIN SUCCESS", objectifiedMessage.loginSuccess);
                this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess);
                break;
            case TYPES.MESSAGE_TYPE.RTC_OFFER:
                this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage.clientId, objectifiedMessage.offer, objectifiedMessage.userNameToConnectTo);
                break;
            case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                break;
            case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                this.handleCandidate(objectifiedMessage.clientId, objectifiedMessage.candidate);
                break;
        }
    }


    //#region SendingFunctions
    public checkChosenUsernameAndCreateLoginRequest = (): void => {
        if (UiElementHandler.loginNameInput != null) {
            this.localUserName = UiElementHandler.loginNameInput.value;
        }
        else { 
            console.error("UI element missing: Loginname Input field"); 
        }
        if (this.localUserName.length <= 0) {
            console.log("Please enter username");
            return;
        }
        this.createLoginRequestAndSendToServer(this.localUserName);
    }

    public createLoginRequestAndSendToServer = (_requestingUsername: string) => {
        const loginMessage: NetworkMessages.LoginRequest = new NetworkMessages.LoginRequest(this.localUserName);
        this.sendMessage(loginMessage);
    }

    public checkUsernameToConnectToAndInitiateConnection = (): void => {
        const callToUsername: string = UiElementHandler.usernameToConnectTo.value;
        if (callToUsername.length === 0) {
            alert("Enter a username 😉");
            return;
        }
        this.userNameLocalIsConnectedTo = callToUsername;
        this.initiateConnectionByCreatingOffer(this.userNameLocalIsConnectedTo);
    }

    public initiateConnectionByCreatingOffer = (_userNameForOffer: string): void => {
        this.connection.createOffer()
            .then((offer) => {
                return this.connection.setLocalDescription(offer);
            })
            .then(() => {
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
            .catch(() => {
                console.error("Offer creation error");
            });
    }

    public createOfferMessageAndSendToRemote = (_userNameForOffer: string) => {
        const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(this.localClientId, _userNameForOffer, this.connection.localDescription);
        this.sendMessage(offerMessage);
    }

    public createAnswerAndSendToRemote = () => {
        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        this.connection.createAnswer()
            .then((answer) => {
                console.log("Setting local description now.");
                return this.connection.setLocalDescription(answer);
            }).then(() => {
                const answerMessage: NetworkMessages.RtcAnswer =
                    new NetworkMessages.RtcAnswer
                        (this.localClientId,
                            this.userNameLocalIsConnectedTo,
                            this.connection.localDescription);

                this.sendMessage(answerMessage);
                console.log("Created answer message and sent: ", answerMessage);
            })
            .catch(() => {
                console.error("Answer creation failed.");
            });
    }



    public sendMessage = (message: Object) => {
        this.ws.send(JSON.stringify(message));
    }

    public sendMessageViaDirectPeerConnection = () => {
        const message: string = UiElementHandler.msgInput.value;
        UiElementHandler.chatbox.innerHTML += "\n" + this.localUserName + ": " + message;
        if (this.peerConnectionToChosenPeer) {
            this.peerConnectionToChosenPeer.send(message);
        }
        else {
            console.error("Peer Connection undefined, connection likely lost");
        }
    }
    //#endregion


    //#region ReceivingFunctions
    public loginValidAddUser = (_assignedId: string, _loginSuccess: boolean): void => {
        if (_loginSuccess) {
            this.localClientId = _assignedId;
            this.createRTCConnection();
            console.log("COnnection at Login: " + this.localClientId + " ", this.connection);
        } else {
            console.log("Login failed, username taken");
        }
    }
    
    // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
    // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
    public receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_localhostId: string, _offer: RTCSessionDescriptionInit, _usernameToRespondTo: string): void => {
        console.log("Setting description on offer and sending answer");
        this.userNameLocalIsConnectedTo = _usernameToRespondTo;
        this.connection.setRemoteDescription(new RTCSessionDescription(_offer))
            .then(() => this.createAnswerAndSendToRemote())
            .catch(this.handleCreateAnswerError);
    }


    public receiveAnswerAndSetRemoteDescription = (_localhostId: string, _answer: RTCSessionDescriptionInit) => {
        console.log("Setting description as answer");
        this.connection = new RTCPeerConnection(this.configuration);
        this.connection.setRemoteDescription(new RTCSessionDescription(_answer));
        console.log("Description set as answer");
    }

    public handleCandidate = (_localhostId: string, _candidate: RTCIceCandidateInit | undefined) => {
        console.log("Adding ice candidates");
        let candidate = new RTCIceCandidate(_candidate);
        this.connection.addIceCandidate(candidate);
    }

    //#endregion

    //#region HelperFunctions
    public handleCreateAnswerError = (err: any) => {
        console.error(err);
    }
    

    // tslint:disable-next-line: no-any
    public parseReceivedMessageAndReturnObject = (_receivedMessage: MessageEvent): any => {
        console.log("Got message", _receivedMessage);

        // tslint:disable-next-line: no-any
        let objectifiedMessage: any;
        try {
            objectifiedMessage = JSON.parse(_receivedMessage.data);

        } catch (error) {
            console.error("Invalid JSON", error);
        }

        return objectifiedMessage;
    }
    //#endregion
    








    

    public createRTCConnection = () => {
        this.connection = new RTCPeerConnection(this.configuration);
        this.peerConnectionToChosenPeer = this.connection.createDataChannel("testChannel");

        this.connection.ondatachannel = (datachannelEvent) => {
            console.log("Data channel is created!");

            datachannelEvent.channel.addEventListener("open", () => {
                console.log("Data channel is open and ready to be used.");
            });
            datachannelEvent.channel.addEventListener("message", (messageEvent) => {
                console.log("Received message: " + messageEvent.data);
                UiElementHandler.chatbox.innerHTML += "\n" + this.userNameLocalIsConnectedTo + ": " + messageEvent.data;
            });
        };

        this.peerConnectionToChosenPeer.onmessage = (event) => {
            console.log("Received message from other peer:", event.data);
            UiElementHandler.chatbox.innerHTML += "<br>" + event.data;
        };

        this.connection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidateMessage: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate(this.localClientId, this.userNameLocalIsConnectedTo, event.candidate);
                this.sendMessage(candidateMessage);
            }
        };
    }



   

    

    

}
