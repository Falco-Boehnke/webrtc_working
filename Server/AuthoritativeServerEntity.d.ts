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
        addIceCandidateToServerConnection: (_receivedIceMessage: IceCandidate) => Promise<void>;
        parseMessageToJson: (_messageToParse: string) => MessageBase;
        receiveAnswerAndSetRemoteDescription: (_websocketClient: any, _answer: RtcAnswer) => void;
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
