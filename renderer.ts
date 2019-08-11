import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { UiElementHandler } from "./DataCollectors/UiElementHandler";
import { SignalingServer } from "./Server/SignalingServer";
let asMode = false;
UiElementHandler.getAllUiElements();
const test: NetworkConnectionManager = new NetworkConnectionManager();
test.createRTCPeerConnectionAndAddListeners();

UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);

UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);

function switchServerMode(){
    if(!asMode){
        UiElementHandler.peerToPeerHtmlElements.style.display = 'none';
        UiElementHandler.authoritativeElements.style.display = 'block';
        asMode = true;
    }
    else{
        UiElementHandler.peerToPeerHtmlElements.style.display = 'block';
        UiElementHandler.authoritativeElements.style.display = 'none';
        asMode = false;
    }
}

function startingUpSignalingServer() {
    SignalingServer.startUpServer(7070);
}

function connectToSignalingServer() {
    test.signalingServerUrl = "ws://" + UiElementHandler.signalingUrl.value;
    test.connectToSpecifiedSignalingServer();
}


// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
