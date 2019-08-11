"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkConnectionManager_1 = require("./NetworkConnectionManager");
const UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
const SignalingServer_1 = require("./Server/SignalingServer");
UiElementHandler_1.UiElementHandler.getAllUiElements();
const test = new NetworkConnectionManager_1.NetworkConnectionManager();
test.createRTCPeerConnectionAndAddListeners();
test.addUiListeners();
UiElementHandler_1.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
UiElementHandler_1.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
UiElementHandler_1.UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
UiElementHandler_1.UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
UiElementHandler_1.UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);
function startingUpSignalingServer() {
    SignalingServer_1.SignalingServer.startUpServer(7070);
}
function connectToSignalingServer() {
    test.signalingServerUrl = "ws://" + UiElementHandler_1.UiElementHandler.signalingUrl.value;
    test.connectToSpecifiedSignalingServer();
}
// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
