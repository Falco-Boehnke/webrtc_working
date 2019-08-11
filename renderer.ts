import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { UiElementHandler } from "./DataCollectors/UiElementHandler";
import { SignalingServer } from "./Server/SignalingServer";

UiElementHandler.getAllUiElements();
const test: NetworkConnectionManager = new NetworkConnectionManager();
test.createRTCPeerConnectionAndAddListeners();
test.addUiListeners();



UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);

function startingUpSignalingServer() {
    SignalingServer.startUpServer(7070);
}

function connectToSignalingServer() {
    test.signalingServerUrl = "ws://" + UiElementHandler.signalingUrl.value;
    test.connectToSpecifiedSignalingServer();
}


// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
