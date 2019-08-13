declare namespace FudgeNetwork {
    class AuthoritativeServerEntity {
        signalingServer: any;
        notYetPeerConnectedClientCollection: Client[];
        peerConnectedClientCollection: Client[];
        peerConnectionBufferCollection: RTCDataChannel[];
        configuration: {
            iceServers: {
                urls: string;
            }[];
        };
        constructor();
        collectClientCreatePeerConnectionAndCreateOffer: (_freshlyConnectedClient: Client) => void;
        createID: () => string;
        addIceCandidateToServerConnection: (_receivedIceMessage: NetworkMessageIceCandidate) => Promise<void>;
        parseMessageToJson: (_messageToParse: string) => NetworkMessageMessageBase;
        receiveAnswerAndSetRemoteDescription: (_websocketClient: any, _answer: NetworkMessageRtcAnswer) => void;
        broadcastMessageToAllConnectedClients: (_messageToBroadcast: string) => void;
        private sendNewIceCandidatesToPeer;
        private dataChannelStatusChangeHandler;
        private dataChannelMessageHandler;
        private initiateConnectionByCreatingDataChannelAndCreatingOffer;
        private createOfferMessageAndSendToRemote;
        private searchForPropertyValueInCollection;
        private searchUserByUserNameAndReturnUser;
        private searchUserByUserIdAndReturnUser;
        private searchUserByWebsocketConnectionAndReturnUser;
    }
}
