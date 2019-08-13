declare namespace FudgeNetwork {
    class NetworkConnectionManager {
        ws: WebSocket;
        signalingServerUrl: string;
        localId: string;
        localUserName: string;
        connection: RTCPeerConnection;
        remoteConnection: RTCPeerConnection | null;
        remoteClientId: string;
        localDataChannel: RTCDataChannel | undefined;
        receivedDataChannelFromRemote: RTCDataChannel | undefined;
        configuration: {
            iceServers: {
                urls: string;
            }[];
        };
        private isInitiator;
        constructor();
        startUpSignalingServerFile: (_serverFileUri: string) => void;
        connectToSpecifiedSignalingServer: () => void;
        addWsEventListeners: () => void;
        sendMessage: (message: Object) => void;
        sendMessageViaDirectPeerConnection: () => void;
        createLoginRequestAndSendToServer: (_requestingUsername: string) => void;
        checkChosenUsernameAndCreateLoginRequest: () => void;
        checkUsernameToConnectToAndInitiateConnection: () => void;
        private parseMessageAndCallCorrespondingMessageHandler;
        private createRTCPeerConnectionAndAddListeners;
        private assignIdAndSendConfirmation;
        private initiateConnectionByCreatingDataChannelAndCreatingOffer;
        private createOfferMessageAndSendToRemote;
        private createAnswerAndSendToRemote;
        private sendNewIceCandidatesToPeer;
        private loginValidAddUser;
        private receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer;
        private receiveAnswerAndSetRemoteDescription;
        private handleCandidate;
        private receiveDataChannel;
        private handleCreateAnswerError;
        private dataChannelStatusChangeHandler;
        private parseReceivedMessageAndReturnObject;
        private dataChannelMessageHandler;
    }
}
