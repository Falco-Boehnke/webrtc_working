"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkConnectionManager_1 = require("./NetworkConnectionManager");
const UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
UiElementHandler_1.UiElementHandler.getAllUiElements();
const test = new NetworkConnectionManager_1.NetworkConnectionManager();
test.createRTCPeerConnectionAndAddListeners();
test.addUiListeners();
UiElementHandler_1.UiElementHandler.startSignalingButton.addEventListener("click", startingUpServer);
UiElementHandler_1.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
function startingUpServer() {
    if (test) {
        test.startUpSignalingServerFile("./Server/ServerMain");
    }
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
