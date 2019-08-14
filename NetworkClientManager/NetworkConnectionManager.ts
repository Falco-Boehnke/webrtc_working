import * as FudgeNetwork from "./../index";

export class NetworkConnectionManager {
    public signalingServerUrl: string = "ws://localhost:8080";
    private webSocketConnectionToSignalingServer!: WebSocket;
    private ownClientId: string;
    private ownUserName: string;
    private ownPeerConnection!: RTCPeerConnection;
    private remoteClientId: string;
    private ownPeerDataChannel: RTCDataChannel | undefined;
    private remoteEventPeerDataChannel: RTCDataChannel | undefined;
    private isInitiator: boolean;
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    // tslint:disable-next-line: typedef
    private configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" }
        ]
    };

    constructor() {
        this.ownUserName = "";
        this.ownClientId = "undefined";
        this.remoteClientId = "";
        this.isInitiator = false;
        this.remoteEventPeerDataChannel = undefined;
        this.createRTCPeerConnectionAndAddListeners();
    }

    // public startUpSignalingServerFile = (_serverFileUri: string): void => {
    //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
    //     let server_test = require("./Server/ServerMain");
    // }

    public connectToSpecifiedSignalingServer = () => {
        try {
            this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerUrl);
            this.addWsEventListeners();
        } catch (error) {
            console.log("Websocket Generation gescheitert");
        }

    }

    public sendMessage = (_message: Object) => {
        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(_message);
        if (this.webSocketConnectionToSignalingServer.readyState == 1) {
            this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
        }
        else {
            console.error("Websocket Connection closed unexpectedly");
        }
    }

    public sendMessageViaDirectPeerConnection = () => {
        let messageObject: FudgeNetwork.PeerMessageSimpleText = new FudgeNetwork.PeerMessageSimpleText(this.ownClientId, FudgeNetwork.UiElementHandler.msgInput.value);
        FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + this.ownUserName + ": " + messageObject.messageData;
        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(messageObject);

        if (this.isInitiator && this.ownPeerDataChannel) {
            this.ownPeerDataChannel.send(stringifiedMessage);
        }
        else if (!this.isInitiator && this.remoteEventPeerDataChannel && this.remoteEventPeerDataChannel.readyState === "open") {
            console.log("Sending Message via received Datachannel");
            this.remoteEventPeerDataChannel.send(stringifiedMessage);
        }
        else {
            console.error("Datachannel: Connection unexpectedly lost");
        }
    }

    public checkChosenUsernameAndCreateLoginRequest = (): void => {
        if (FudgeNetwork.UiElementHandler.loginNameInput != null) {
            this.ownUserName = FudgeNetwork.UiElementHandler.loginNameInput.value;
        }
        else {
            console.error("UI element missing: Loginname Input field");
        }
        if (this.ownUserName.length <= 0) {
            console.log("Please enter username");
            return;
        }
        this.createLoginRequestAndSendToServer(this.ownUserName);
    }
    private createLoginRequestAndSendToServer = (_requestingUsername: string) => {
        const loginMessage: FudgeNetwork.NetworkMessageLoginRequest = new FudgeNetwork.NetworkMessageLoginRequest(this.ownClientId, this.ownUserName);
        this.sendMessage(loginMessage);
    }
    public checkUsernameToConnectToAndInitiateConnection = (): void => {
        const callToUsername: string = FudgeNetwork.UiElementHandler.usernameToConnectTo.value;
        if (callToUsername.length === 0) {
            console.error("Enter a username 😉");
            return;
        }
        this.remoteClientId = callToUsername;
        console.log("Username to connect to: " + this.remoteClientId);
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.remoteClientId);
    }

    private addWsEventListeners = (): void => {
        this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen: Event) => {
            console.log("Conneced to the signaling server", _connOpen);
        });

        this.webSocketConnectionToSignalingServer.addEventListener("error", (_err: Event) => {
            console.error(_err);
        });

        this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage: MessageEvent) => {
            this.parseMessageAndCallCorrespondingMessageHandler(_receivedMessage);
        });
    }


  
    private parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage: MessageEvent) => {
        // tslint:disable-next-line: typedef
        let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);

        console.log("Received message:", objectifiedMessage);
        switch (objectifiedMessage.messageType) {
            case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                console.log("ID received, assigning to self");

                this.assignIdAndSendConfirmation(objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE:
                this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                break;

            case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                // console.log("Received offer, current signaling state: ", this.connection.signalingState);
                this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                break;

            case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                this.handleCandidate(objectifiedMessage);
                break;
        }
    }

    private createRTCPeerConnectionAndAddListeners = () => {
        console.log("Creating RTC Connection");
        this.ownPeerConnection = new RTCPeerConnection(this.configuration);
        this.ownPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
    }

    private assignIdAndSendConfirmation = (_message: FudgeNetwork.NetworkMessageIdAssigned) => {
        this.ownClientId = _message.assignedId;
        this.sendMessage(new FudgeNetwork.NetworkMessageIdAssigned(this.ownClientId));
    }



    private initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer: string): void => {
        console.log("Creating Datachannel for connection and then creating offer");
        this.isInitiator = true;
        this.ownPeerDataChannel = this.ownPeerConnection.createDataChannel("localDataChannel");
        this.ownPeerDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
        this.ownPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
        this.ownPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
        this.ownPeerConnection.createOffer()
            .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                return offer;
            })
            .then(async (offer) => {
                await this.ownPeerConnection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            })
            .then(() => {
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
            .catch(() => {
                console.error("Offer creation error");
            });
    }

    private createOfferMessageAndSendToRemote = (_userNameForOffer: string) => {
        const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(this.ownClientId, _userNameForOffer, this.ownPeerConnection.localDescription);
        this.sendMessage(offerMessage);
        console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
    }

    private createAnswerAndSendToRemote = (_remoteIdToAnswerTo: string) => {
        let ultimateAnswer: RTCSessionDescription;
        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        this.ownPeerConnection.createAnswer()
            .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.ownPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);

                const answerMessage: FudgeNetwork.NetworkMessageRtcAnswer =
                    new FudgeNetwork.NetworkMessageRtcAnswer(this.ownClientId, _remoteIdToAnswerTo, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessage(answerMessage);
            })
            .catch(() => {
                console.error("Answer creation failed.");
            });
    }

    // tslint:disable-next-line: no-any
    private sendNewIceCandidatesToPeer = ({ candidate }: any) => {
        console.log("Sending ICECandidates from: ", this.ownClientId);
        let message: FudgeNetwork.NetworkMessageIceCandidate = new FudgeNetwork.NetworkMessageIceCandidate(this.ownClientId, this.remoteClientId, candidate);
        this.sendMessage(message);

    }

    private loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
        if (_loginSuccess) {
            this.ownUserName = _originatorUserName;
            console.log("Local Username: " + this.ownUserName);
        } else {
            console.log("Login failed, username taken");
        }
    }

    // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
    // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
    private receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void => {
        console.log("Setting description on offer and sending answer to username: ", _offerMessage.userNameToConnectTo);
        this.ownPeerConnection.addEventListener("datachannel", this.receiveDataChannel);
        this.remoteClientId = _offerMessage.originatorId;
        console.log("UserID to send answer to ", this.remoteClientId);
        let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit | null = _offerMessage.offer;
        if (!offerToSet) {
            return;
        }
        this.ownPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
            .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                await this.createAnswerAndSendToRemote(_offerMessage.originatorId);
            })
            .catch(this.handleCreateAnswerError);
        console.log("End of Function Receive offer, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
    }


    private receiveAnswerAndSetRemoteDescription = (_localhostId: string, _answer: RTCSessionDescriptionInit) => {

        // console.log("Setting description as answer");
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_answer);
        // console.log("Receiving Answer, setting remote desc Expected 'have-local-offer'|'have-remote-offer, got:  ", this.connection.signalingState);
        this.ownPeerConnection.setRemoteDescription(descriptionAnswer);
        // console.log("Remote Description set");
        // console.log("Signaling state:", this.connection.signalingState);
    }

    private handleCandidate = async (_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate) => {
        if (_receivedIceMessage.candidate) {
            // console.log("ASyncly adding candidates");
            await this.ownPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
        }
    }

    private receiveDataChannel = (event: { channel: RTCDataChannel | undefined; }) => {

        console.log("Receice Datachannel event");
        this.remoteEventPeerDataChannel = event.channel;
        if (this.remoteEventPeerDataChannel) {
            this.remoteEventPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            this.remoteEventPeerDataChannel.addEventListener("open", this.enableKeyboardPressesForSending);
            this.remoteEventPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
        }
    }

    private handleCreateAnswerError = (err: Event) => {
        console.error(err);
    }

    private enableKeyboardPressesForSending = () => {
        let browser: Document = FudgeNetwork.UiElementHandler.electronWindow;
        browser.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.keyCode == 27) {
                this.sendDisconnectRequest();
            }
            else {
                this.sendKeyPress(event.keyCode);
            }
        });
    }

    private sendDisconnectRequest = () => {
        let dcRequest: FudgeNetwork.PeerMessageDisconnectClient = new FudgeNetwork.PeerMessageDisconnectClient(this.ownClientId);
        this.sendPeerMessageToServer(dcRequest);
    }
    private sendKeyPress = (_keyCode: number) => {
        if (this.remoteEventPeerDataChannel != undefined) {
            let keyPressMessage: FudgeNetwork.PeerMessageKeysInput = new FudgeNetwork.PeerMessageKeysInput(this.ownClientId, _keyCode);
            this.sendPeerMessageToServer(keyPressMessage);
        }
    }

    private sendPeerMessageToServer = (_messageToSend: Object) => {
        try {
            let stringifiedMessage: string = JSON.stringify(_messageToSend);
            if (this.remoteEventPeerDataChannel) {
                this.remoteEventPeerDataChannel.send(stringifiedMessage);
            }
        } catch (error) {
            console.error("Error occured when stringifying PeerMessage");
            console.error(error);
        }
    }
    private dataChannelStatusChangeHandler = (event: Event) => {
        //TODO Reconnection logic
        console.log("Channel Event happened", event);
    }

    // tslint:disable-next-line: no-any
    private parseReceivedMessageAndReturnObject = (_receivedMessage: MessageEvent): any => {
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

    private dataChannelMessageHandler = (_messageEvent: MessageEvent) => {
        // TODO Fix it so that both clients have names instead of IDs for usage
        FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + this.remoteClientId + ": " + _messageEvent.data;
    }

    private stringifyObjectForNetworkSending = (_objectToStringify: Object): string =>{
        let stringifiedObject: string = "";
        try {
            stringifiedObject = JSON.stringify(_objectToStringify);
        } catch (error) {
            console.error("JSON Parse failed", error);
        }
        return stringifiedObject;
    }
}
