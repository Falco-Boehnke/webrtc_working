declare namespace FudgeNetwork {
    class Client {
        clientConnection: WebSocket | null;
        id: string;
        userName: string;
        peerConnection: RTCPeerConnection;
        dataChannel: RTCDataChannel;
        constructor(websocketConnection?: WebSocket, uniqueClientId?: string, loginName?: string);
    }
}
