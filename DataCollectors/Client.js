"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(websocketConnection, uniqueClientId, loginName, connectedToRoom) {
        this.clientConnection = websocketConnection || null;
        this.peerConnection = new RTCPeerConnection();
        this.id = uniqueClientId || "";
        this.userName = loginName || "";
        this.connectedRoom = connectedToRoom || null;
    }
}
exports.Client = Client;
