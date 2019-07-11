import { UiElementHandler } from "./DataCollectors/UiElementHandler";
import * as TYPES from "./DataCollectors/Enumerators/EnumeratorCollection";
import * as NetworkMessages from "./NetworkMessages";



export class NetworkConnectionManager {
    public ws: WebSocket;
    public localClientId: string;
    public localUserName: string;
    public connection!: RTCPeerConnection;
    public remoteConnection: RTCPeerConnection | null;
    public userNameLocalIsConnectedTo: string;
    public localDataChannel: RTCDataChannel | undefined;
    public receivedDataChannelFromRemote: RTCDataChannel | undefined;

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
        this.remoteConnection = null;
        this.userNameLocalIsConnectedTo = "";
        this.receivedDataChannelFromRemote = undefined;
        this.createRTCPeerConnectionAndAddListeners();
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

    public createRTCPeerConnectionAndAddListeners = () => {
        console.log("Creating RTC Connection");
        this.connection = new RTCPeerConnection(this.configuration);

        this.connection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
        this.connection.addEventListener("datachannel", this.receiveDataChannel);
        console.log("CreateRTCConection State, Expected 'stable', got:  ", this.connection.signalingState);

    }
    //#endregion

    public parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage: MessageEvent) => {
        // tslint:disable-next-line: typedef
        let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);

        console.log("Received message:", objectifiedMessage);
        switch (objectifiedMessage.messageType) {
            case TYPES.MESSAGE_TYPE.LOGIN_RESPONSE:
                console.log("LOGIN SUCCESS", objectifiedMessage.loginSuccess);
                this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                break;
            case TYPES.MESSAGE_TYPE.RTC_OFFER:
                this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                break;
            case TYPES.MESSAGE_TYPE.RTC_ANSWER:
                this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                break;
            case TYPES.MESSAGE_TYPE.ICE_CANDIDATE:
                this.handleCandidate(objectifiedMessage.candidate);
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

        // TODO Fehler ist das sich der answerer selbst die message schickt weil der
        // Username zu dem es connected ist nicht richtig gepeichert wird
        // Muss umwandeln zu IDs
        this.userNameLocalIsConnectedTo = callToUsername;
        console.log("Username to connect to: " + this.userNameLocalIsConnectedTo);
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.userNameLocalIsConnectedTo);
    }

    public initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer: string): void => {
        console.log("Creating Datachannel for connection and then creating offer");
        this.localDataChannel = this.connection.createDataChannel("localDataChannel");
        this.localDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
        this.localDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
        this.localDataChannel.addEventListener("message", this.dataChannelMessageHandler);
        this.connection.createOffer()
            .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.connection.signalingState);
                return offer;
            })
            .then(async (offer) => {
                await this.connection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.connection.signalingState);
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
        console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.connection.signalingState);
    }

    public createAnswerAndSendToRemote = () => {
        let ultimateAnswer: RTCSessionDescription;
        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        this.connection.createAnswer()
            .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.connection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.connection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.connection.signalingState);
                
                const answerMessage: NetworkMessages.RtcAnswer =
                    new NetworkMessages.RtcAnswer
                        (this.localClientId,
                         this.userNameLocalIsConnectedTo,
                         ultimateAnswer);
                console.log("Sending AnswerObject to: " + answerMessage.userNameToConnectTo);
                await this.sendMessage(answerMessage);
            })
            .catch(() => {
                console.error("Answer creation failed.");
            });
    }

    public sendNewIceCandidatesToPeer = ({ candidate }: any) => {
        let message = new NetworkMessages.IceCandidate("", "", candidate);
        this.sendMessage(message);

    }



    public sendMessage = (message: Object) => {
        this.ws.send(JSON.stringify(message));
    }

    public sendMessageViaDirectPeerConnection = () => {
        const message: string = UiElementHandler.msgInput.value;
        UiElementHandler.chatbox.innerHTML += "\n" + this.localUserName + ": " + message;
        if (this.receivedDataChannelFromRemote) {
            this.receivedDataChannelFromRemote.send(message);
        }
        else {
            console.error("Peer Connection undefined, connection likely lost");
        }
    }
    //#endregion


    //#region ReceivingFunctions
    public loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
        if (_loginSuccess) {
            this.localClientId = _assignedId;
            this.localUserName = _originatorUserName;
            console.log("Local Username: " + this.localUserName);
            console.log("COnnection at Login: " + this.localClientId + " ", this.connection);
        } else {
            console.log("Login failed, username taken");
        }
    }

    // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
    // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
    public receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage: NetworkMessages.RtcOffer): void => {
        console.log("Setting description on offer and sending answer to username: ", _offerMessage.userNameToConnectTo);
        this.userNameLocalIsConnectedTo = _offerMessage.originatorId;
        let offerToSet = _offerMessage.offer;
        if (!offerToSet) {
            return;
        }
        this.connection.setRemoteDescription(new RTCSessionDescription(offerToSet))
            .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.connection.signalingState);
                await this.createAnswerAndSendToRemote();
            })
            .catch(this.handleCreateAnswerError);
        console.log("End of Function Receive offer, Expected 'stable', got:  ", this.connection.signalingState);
    }


    public receiveAnswerAndSetRemoteDescription = (_localhostId: string, _answer: RTCSessionDescriptionInit) => {

        console.log("Setting description as answer");
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_answer);
        console.log("Receiving Answer, setting remote desc Expected 'have-local-offer'|'have-remote-offer, got:  ", this.connection.signalingState);
        //TODO DAS IST DIE FEHLERQUELLE

        this.connection.setRemoteDescription(descriptionAnswer);
        console.log("Description set as answer");
    }

    public handleCandidate = async (event: MessageEvent) => {
        console.log(event);

    }

    public receiveDataChannel = (event: any) => {

        console.log("Receice Datachannel event");
        this.receivedDataChannelFromRemote = event.channel;
        if (this.receivedDataChannelFromRemote) {
            this.receivedDataChannelFromRemote.addEventListener("message", this.dataChannelMessageHandler);
            this.receivedDataChannelFromRemote.addEventListener("open", this.dataChannelStatusChangeHandler);
            this.receivedDataChannelFromRemote.addEventListener("close", this.dataChannelStatusChangeHandler);
        }
    }

    //#endregion

    //#region HelperFunctions
    public handleCreateAnswerError = (err: any) => {
        console.error(err);
    }

    public dataChannelStatusChangeHandler = (event: any) => {
        //TODO Reconnection logic
        console.log("Channel Event happened", event);

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

    public dataChannelMessageHandler = (_messageEvent: MessageEvent) => {
        UiElementHandler.chatbox.innerHTML += "\n" + this.userNameLocalIsConnectedTo + ": " + _messageEvent.data;
    }
    //#endregion











    // public createRTCConnection = () => {
    //     this.connection = new RTCPeerConnection(this.configuration);
    //     this.receivedDataChannelFromRemote = this.connection.createDataChannel("testChannel");

    //     this.connection.ondatachannel = (datachannelEvent) => {
    //         console.log("Data channel is created!");

    //         datachannelEvent.channel.addEventListener("open", () => {
    //             console.log("Data channel is open and ready to be used.");
    //         });
    //         datachannelEvent.channel.addEventListener("message", (messageEvent) => {
    //             console.log("Received message: " + messageEvent.data);
    //             UiElementHandler.chatbox.innerHTML += "\n" + this.userNameLocalIsConnectedTo + ": " + messageEvent.data;
    //         });
    //     };

    //     this.receivedDataChannelFromRemote.onmessage = (event) => {
    //         console.log("Received message from other peer:", event.data);
    //         UiElementHandler.chatbox.innerHTML += "<br>" + event.data;
    //     };


    // }









}
