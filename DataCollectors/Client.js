"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    class Client {
        constructor(websocketConnection, uniqueClientId, loginName, connectedToRoom) {
            this.clientConnection = websocketConnection || null;
            this.peerConnection = new RTCPeerConnection();
            this.dataChannel = this.peerConnection.createDataChannel("placeholder");
            this.id = uniqueClientId || "";
            this.userName = loginName || "";
            this.connectedRoom = connectedToRoom || null;
        }
    }
    FudgeNetwork.Client = Client;
})(FudgeNetwork || (FudgeNetwork = {}));
