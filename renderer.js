System.register(["./NetworkConnectionManager", "./DataCollectors/UiElementHandler", "./Server/AuthoritativeSignalingServer", "./Server/PeerToPeerSignalingServer"], function (exports_1, context_1) {
    "use strict";
    var NetworkConnectionManager_1, UiElementHandler_1, AuthoritativeSignalingServer_1, PeerToPeerSignalingServer_1, asMode, test;
    var __moduleName = context_1 && context_1.id;
    function broadcastMessageToClients() {
        AuthoritativeSignalingServer_1.AuthoritativeSignalingServer.authoritativeServerEntity.broadcastMessageToAllConnectedClients("TEST");
    }
    function switchServerMode() {
        let switchbutton = UiElementHandler_1.UiElementHandler.switchModeButton;
        if (!asMode) {
            switchbutton.textContent = "Switch To P2P Mode";
            UiElementHandler_1.UiElementHandler.peerToPeerHtmlElements.style.display = "none";
            UiElementHandler_1.UiElementHandler.authoritativeElements.style.display = "block";
            asMode = true;
        }
        else {
            switchbutton.textContent = "Switch To Authoritative Mode";
            UiElementHandler_1.UiElementHandler.peerToPeerHtmlElements.style.display = "block";
            UiElementHandler_1.UiElementHandler.authoritativeElements.style.display = "none";
            asMode = false;
        }
    }
    function startingUpSignalingServer() {
        console.log("Turning server ONLINE");
        if (asMode) {
            AuthoritativeSignalingServer_1.AuthoritativeSignalingServer.startUpServer(9090);
        }
        else {
            PeerToPeerSignalingServer_1.PeerToPeerSignalingServer.startUpServer(9090);
        }
        let startSignalingButton = UiElementHandler_1.UiElementHandler.startSignalingButton;
        startSignalingButton.disabled = true;
        let stopSignalingButton = UiElementHandler_1.UiElementHandler.stopSignalingServer;
        stopSignalingButton.disabled = false;
        let switchButton = UiElementHandler_1.UiElementHandler.switchModeButton;
        switchButton.disabled = true;
    }
    function turnOffSignalingServer() {
        console.log("Turning server offline");
        if (asMode) {
            AuthoritativeSignalingServer_1.AuthoritativeSignalingServer.closeDownServer();
        }
        else {
            PeerToPeerSignalingServer_1.PeerToPeerSignalingServer.closeDownServer();
        }
        let startSignalingButton = UiElementHandler_1.UiElementHandler.startSignalingButton;
        startSignalingButton.disabled = false;
        let stopSignalingButton = UiElementHandler_1.UiElementHandler.stopSignalingServer;
        stopSignalingButton.disabled = true;
        let switchButton = UiElementHandler_1.UiElementHandler.switchModeButton;
        switchButton.disabled = false;
    }
    function connectToSignalingServer() {
        test.signalingServerUrl = "ws://" + UiElementHandler_1.UiElementHandler.signalingUrl.value;
        test.connectToSpecifiedSignalingServer();
    }
    return {
        setters: [
            function (NetworkConnectionManager_1_1) {
                NetworkConnectionManager_1 = NetworkConnectionManager_1_1;
            },
            function (UiElementHandler_1_1) {
                UiElementHandler_1 = UiElementHandler_1_1;
            },
            function (AuthoritativeSignalingServer_1_1) {
                AuthoritativeSignalingServer_1 = AuthoritativeSignalingServer_1_1;
            },
            function (PeerToPeerSignalingServer_1_1) {
                PeerToPeerSignalingServer_1 = PeerToPeerSignalingServer_1_1;
            }
        ],
        execute: function () {
            asMode = false;
            test = new NetworkConnectionManager_1.NetworkConnectionManager();
            UiElementHandler_1.UiElementHandler.getAllUiElements();
            UiElementHandler_1.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
            UiElementHandler_1.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
            UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
            UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
            UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);
            UiElementHandler_1.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
            UiElementHandler_1.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
            UiElementHandler_1.UiElementHandler.broadcastButton.addEventListener("click", broadcastMessageToClients);
        }
    };
});
