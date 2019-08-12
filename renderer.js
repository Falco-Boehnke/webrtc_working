"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkConnectionManager_1 = require("./NetworkConnectionManager");
const UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
const AuthoritativeSignalingServer_1 = require("./Server/AuthoritativeSignalingServer");
const PeerToPeerSignalingServer_1 = require("./Server/PeerToPeerSignalingServer");
let asMode = false;
const test = new NetworkConnectionManager_1.NetworkConnectionManager();
UiElementHandler_1.UiElementHandler.getAllUiElements();
UiElementHandler_1.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
UiElementHandler_1.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);
UiElementHandler_1.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
UiElementHandler_1.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
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
// function test2 (){
//     let test2 = require("./Server/PeerToPeerSignalingServer");
// }
// test2();
// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
