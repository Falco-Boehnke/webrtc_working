"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { NetworkConnectionManager } from "./NetworkConnectionManager";
// import { FudgeNetwork.UiElementHandler } from "./DataCollectors/FudgeNetwork.UiElementHandler";
const AuthoritativeSignalingServer_1 = require("./Server/AuthoritativeSignalingServer");
const PeerToPeerSignalingServer_1 = require("./Server/PeerToPeerSignalingServer");
let asMode = false;
const test = new FudgeNetwork.NetworkConnectionManager();
FudgeNetwork.UiElementHandler.getAllUiElements();
FudgeNetwork.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
FudgeNetwork.UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
FudgeNetwork.UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);
FudgeNetwork.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
FudgeNetwork.UiElementHandler.broadcastButton.addEventListener("click", broadcastMessageToClients);
function broadcastMessageToClients() {
    AuthoritativeSignalingServer_1.AuthoritativeSignalingServer.authoritativeServerEntity.broadcastMessageToAllConnectedClients("TEST");
}
function switchServerMode() {
    let switchbutton = FudgeNetwork.UiElementHandler.switchModeButton;
    if (!asMode) {
        switchbutton.textContent = "Switch To P2P Mode";
        FudgeNetwork.UiElementHandler.peerToPeerHtmlElements.style.display = "none";
        FudgeNetwork.UiElementHandler.authoritativeElements.style.display = "block";
        asMode = true;
    }
    else {
        switchbutton.textContent = "Switch To Authoritative Mode";
        FudgeNetwork.UiElementHandler.peerToPeerHtmlElements.style.display = "block";
        FudgeNetwork.UiElementHandler.authoritativeElements.style.display = "none";
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
    let startSignalingButton = FudgeNetwork.UiElementHandler.startSignalingButton;
    startSignalingButton.hidden = true;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.stopSignalingServer;
    stopSignalingButton.hidden = false;
    let switchButton = FudgeNetwork.UiElementHandler.switchModeButton;
    switchButton.hidden = true;
}
function turnOffSignalingServer() {
    console.log("Turning server offline");
    if (asMode) {
        AuthoritativeSignalingServer_1.AuthoritativeSignalingServer.closeDownServer();
    }
    else {
        PeerToPeerSignalingServer_1.PeerToPeerSignalingServer.closeDownServer();
    }
    let startSignalingButton = FudgeNetwork.UiElementHandler.startSignalingButton;
    startSignalingButton.hidden = false;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.stopSignalingServer;
    stopSignalingButton.hidden = true;
    let switchButton = FudgeNetwork.UiElementHandler.switchModeButton;
    switchButton.hidden = false;
}
function connectToSignalingServer() {
    test.signalingServerUrl = "ws://" + FudgeNetwork.UiElementHandler.signalingUrl.value;
    test.connectToSpecifiedSignalingServer();
}
// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
