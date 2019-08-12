System.register([], function (exports_1, context_1) {
    "use strict";
    var Client;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Client = class Client {
                constructor(websocketConnection, uniqueClientId, loginName, connectedToRoom) {
                    this.clientConnection = websocketConnection || null;
                    this.peerConnection = new RTCPeerConnection();
                    this.dataChannel = this.peerConnection.createDataChannel("placeholder");
                    this.id = uniqueClientId || "";
                    this.userName = loginName || "";
                    this.connectedRoom = connectedToRoom || null;
                }
            };
            exports_1("Client", Client);
        }
    };
});
