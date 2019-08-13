namespace FudgeNetwork {
    export class NetworkConnectionManager {
        public ws!: WebSocket;
        public signalingServerUrl: string = "ws://localhost:8080";
        public localId: string;
        public localUserName: string;
        public connection!: RTCPeerConnection;
        public remoteConnection: RTCPeerConnection | null;
        public remoteClientId: string;
        public localDataChannel: RTCDataChannel | undefined;
        public receivedDataChannelFromRemote: RTCDataChannel | undefined;

        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        // tslint:disable-next-line: typedef
        public configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        private isInitiator: boolean;

        constructor() {
            this.localUserName = "";
            this.localId = "undefined";
            this.remoteConnection = null;
            this.remoteClientId = "";
            this.isInitiator = false;
            this.receivedDataChannelFromRemote = undefined;

            this.createRTCPeerConnectionAndAddListeners();
        }

        // public startUpSignalingServerFile = (_serverFileUri: string): void => {
        //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
        //     let server_test = require("./Server/ServerMain");
        // }

        public connectToSpecifiedSignalingServer = () => {
            this.ws = new WebSocket(this.signalingServerUrl);
            this.addWsEventListeners();
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



        public sendMessage = (message: Object) => {
            this.ws.send(JSON.stringify(message));
        }

        public sendMessageViaDirectPeerConnection = () => {
            let message: PeerMessageSimpleText = new PeerMessageSimpleText(this.localId, UiElementHandler.msgInput.value);
            UiElementHandler.chatbox.innerHTML += "\n" + this.localUserName + ": " + message;
            let stringifiedMessage: string = JSON.stringify(message);

            if (this.isInitiator && this.localDataChannel) {
                this.localDataChannel.send(stringifiedMessage);
            }
            else if (!this.isInitiator && this.receivedDataChannelFromRemote) {
                console.log("Sending Message via received Datachannel");
                this.receivedDataChannelFromRemote.send(stringifiedMessage);
            }
            else {
                console.error("Peer Connection undefined, connection likely lost");
            }
        }

        public createLoginRequestAndSendToServer = (_requestingUsername: string) => {
            const loginMessage: FudgeNetwork.NetworkMessageLoginRequest = new FudgeNetwork.NetworkMessageLoginRequest(this.localId, this.localUserName);
            this.sendMessage(loginMessage);
        }

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



        public checkUsernameToConnectToAndInitiateConnection = (): void => {
            const callToUsername: string = UiElementHandler.usernameToConnectTo.value;
            if (callToUsername.length === 0) {
                console.error("Enter a username 😉");
                return;
            }

            // TODO Fehler ist das sich der answerer selbst die message schickt weil der
            // Username zu dem es connected ist nicht richtig gepeichert wird
            // Muss umwandeln zu IDs
            this.remoteClientId = callToUsername;
            console.log("Username to connect to: " + this.remoteClientId);
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.remoteClientId);
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
            this.connection = new RTCPeerConnection(this.configuration);
            this.connection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
        }

        private assignIdAndSendConfirmation = (_message: FudgeNetwork.NetworkMessageIdAssigned) => {
            this.localId = _message.assignedId;
            this.sendMessage(new FudgeNetwork.NetworkMessageIdAssigned(this.localId));
        }



        private initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer: string): void => {
            console.log("Creating Datachannel for connection and then creating offer");
            this.isInitiator = true;
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

        private createOfferMessageAndSendToRemote = (_userNameForOffer: string) => {
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(this.localId, _userNameForOffer, this.connection.localDescription);
            this.sendMessage(offerMessage);
            console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.connection.signalingState);
        }

        private createAnswerAndSendToRemote = (_remoteIdToAnswerTo: string) => {
            let ultimateAnswer: RTCSessionDescription;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.connection.createAnswer()
                .then(async (answer) => {
                    console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.connection.signalingState);
                    ultimateAnswer = new RTCSessionDescription(answer);
                    return await this.connection.setLocalDescription(ultimateAnswer);
                }).then(async () => {
                    console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.connection.signalingState);

                    const answerMessage: FudgeNetwork.NetworkMessageRtcAnswer =
                        new FudgeNetwork.NetworkMessageRtcAnswer(this.localId, _remoteIdToAnswerTo, "", ultimateAnswer);
                    console.log("AnswerObject: ", answerMessage);
                    await this.sendMessage(answerMessage);
                })
                .catch(() => {
                    console.error("Answer creation failed.");
                });
        }

        // tslint:disable-next-line: no-any
        private sendNewIceCandidatesToPeer = ({ candidate }: any) => {
            console.log("Sending ICECandidates from: ", this.localId);
            let message: NetworkMessageIceCandidate = new NetworkMessageIceCandidate(this.localId, this.remoteClientId, candidate);
            this.sendMessage(message);

        }

        private loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
            if (_loginSuccess) {
                this.localUserName = _originatorUserName;
                console.log("Local Username: " + this.localUserName);
            } else {
                console.log("Login failed, username taken");
            }
        }

        // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
        // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
        private receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void => {
            console.log("Setting description on offer and sending answer to username: ", _offerMessage.userNameToConnectTo);
            this.connection.addEventListener("datachannel", this.receiveDataChannel);
            this.remoteClientId = _offerMessage.originatorId;
            console.log("UserID to send answer to ", this.remoteClientId);
            let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit | null = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            this.connection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                    console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.connection.signalingState);
                    await this.createAnswerAndSendToRemote(_offerMessage.originatorId);
                })
                .catch(this.handleCreateAnswerError);
            console.log("End of Function Receive offer, Expected 'stable', got:  ", this.connection.signalingState);
        }


        private receiveAnswerAndSetRemoteDescription = (_localhostId: string, _answer: RTCSessionDescriptionInit) => {

            // console.log("Setting description as answer");
            let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_answer);
            // console.log("Receiving Answer, setting remote desc Expected 'have-local-offer'|'have-remote-offer, got:  ", this.connection.signalingState);
            this.connection.setRemoteDescription(descriptionAnswer);
            // console.log("Remote Description set");
            // console.log("Signaling state:", this.connection.signalingState);
        }

        private handleCandidate = async (_receivedIceMessage: NetworkMessageIceCandidate) => {
            if (_receivedIceMessage.candidate) {
                // console.log("ASyncly adding candidates");
                await this.connection.addIceCandidate(_receivedIceMessage.candidate);
            }
        }

        private receiveDataChannel = (event: { channel: RTCDataChannel | undefined; }) => {

            console.log("Receice Datachannel event");
            this.receivedDataChannelFromRemote = event.channel;
            if (this.receivedDataChannelFromRemote) {
                this.receivedDataChannelFromRemote.addEventListener("message", this.dataChannelMessageHandler);
                this.receivedDataChannelFromRemote.addEventListener("open", this.enableKeyboardPressesForSending);
                this.receivedDataChannelFromRemote.addEventListener("close", this.dataChannelStatusChangeHandler);
            }
        }

        private handleCreateAnswerError = (err: Event) => {
            console.error(err);
        }

        private enableKeyboardPressesForSending = () => {
            let browser: Document = UiElementHandler.electronWindow;
            browser.addEventListener("keydown", (event: KeyboardEvent) => {
                console.log("Key pressed");
                let x = JSON.stringify(event.keyCode);
                this.sendKeyPress(x);
            });
        }

        private sendKeyPress = (_keyCode: string) => {
            console.log(this.localDataChannel);
            if (this.localDataChannel != undefined) {
                console.log("Sending message");
                this.localDataChannel.send(_keyCode);
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
            UiElementHandler.chatbox.innerHTML += "\n" + this.remoteClientId + ": " + _messageEvent.data;
        }
    }
}