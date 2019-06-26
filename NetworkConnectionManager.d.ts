export declare class NetworkConnectionManager {
    ws: WebSocket;
    username: string;
    connection: RTCPeerConnection;
    otherUsername: string;
    peerConnection: RTCDataChannel | undefined;
    configuration: {
        iceServers: {
            urls: string;
        }[];
    };
    constructor();
    addUiListeners: () => void;
    addWsEventListeners: () => void;
    handleCandidate: (_candidate: RTCIceCandidateInit | undefined) => void;
    handleAnswer: (_answer: RTCSessionDescriptionInit) => void;
    handleOffer: (_offer: RTCSessionDescriptionInit, _username: string) => void;
    handleLogin: (_loginSuccess: boolean) => void;
    loginLogic: () => void;
    createRTCConnection: () => void;
    connectToUser: () => void;
    createRtcOffer: (_userNameForOffer: string) => void;
    sendMessage: (message: Object) => void;
    sendMessageToUser: () => void;
}
