import { ServerRoom } from "./ServerRoom";
export class Client {

    public clientConnection: WebSocket | null;
    public id: string;
    public userName: string;
    public peerConnection: RTCPeerConnection;
    public dataChannel: RTCDataChannel;
    public connectedRoom: ServerRoom | null;

    constructor(websocketConnection?: WebSocket,
                uniqueClientId?: string,
                loginName?: string,
                connectedToRoom?: ServerRoom) {

        this.clientConnection = websocketConnection || null;
        this.peerConnection = new RTCPeerConnection();
        this.dataChannel = this.peerConnection.createDataChannel("placeholder");
        this.id = uniqueClientId || "";
        this.userName = loginName || "";
        this.connectedRoom = connectedToRoom || null;
    }
}

