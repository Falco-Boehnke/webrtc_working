"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("./index"));
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
    FudgeNetwork.AuthoritativeSignalingServer.authoritativeServerEntity.broadcastMessageToAllConnectedClients("TEST");
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
        FudgeNetwork.AuthoritativeSignalingServer.startUpServer(9090);
    }
    else {
        FudgeNetwork.PeerToPeerSignalingServer.startUpServer(9090);
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
        FudgeNetwork.AuthoritativeSignalingServer.closeDownServer();
    }
    else {
        FudgeNetwork.PeerToPeerSignalingServer.closeDownServer();
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
