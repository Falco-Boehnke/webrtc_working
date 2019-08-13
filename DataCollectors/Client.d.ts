declare namespace FudgeNetwork {
    class Client {
        clientConnection: WebSocket | null;
        id: string;
        userName: string;
        peerConnection: RTCPeerConnection;
        dataChannel: RTCDataChannel;
        connectedRoom: ServerRoom | null;
        constructor(websocketConnection?: WebSocket, uniqueClientId?: string, loginName?: string, connectedToRoom?: ServerRoom);
    }
}
