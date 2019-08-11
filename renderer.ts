import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { UiElementHandler } from "./DataCollectors/UiElementHandler";
import { AuthoritativeSignalingServer } from "./Server/AuthoritativeSignalingServer";
import { PeerToPeerSignalingServer } from "./Server/PeerToPeerSignalingServer";



let asMode = false;
const test: NetworkConnectionManager = new NetworkConnectionManager();

UiElementHandler.getAllUiElements();
UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);
UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);

function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = UiElementHandler.switchModeButton as HTMLButtonElement;
    if (!asMode) {
        switchbutton.innerHTML = "Switch To P2P Mode";
        UiElementHandler.peerToPeerHtmlElements.style.display = "none";
        UiElementHandler.authoritativeElements.style.display = "block";
        asMode = true;
    }
    else {
        switchbutton.innerHTML = "Switch To Authoritative Mode";
        UiElementHandler.peerToPeerHtmlElements.style.display = "block";
        UiElementHandler.authoritativeElements.style.display = "none";
        asMode = false;
    }
}

function startingUpSignalingServer(): void {
    console.log("Turning server ONLINE");
    if (asMode) {
        AuthoritativeSignalingServer.startUpServer(7070);
    }
    else {
        PeerToPeerSignalingServer.startUpServer(7070);
    }
    let startSignalingButton: HTMLButtonElement = UiElementHandler.startSignalingButton as HTMLButtonElement;
    startSignalingButton.disabled = true;
    let stopSignalingButton: HTMLButtonElement = UiElementHandler.stopSignalingServer as HTMLButtonElement;
    stopSignalingButton.disabled = false;
    let switchButton: HTMLButtonElement = UiElementHandler.switchModeButton as HTMLButtonElement;
    switchButton.disabled = true;
}

function turnOffSignalingServer(): void {
    console.log("Turning server offline");
    if (asMode) {
        
        AuthoritativeSignalingServer.closeDownServer();
    }
    else {
        PeerToPeerSignalingServer.closeDownServer();
    }

    let buttontest: HTMLButtonElement = UiElementHandler.startSignalingButton as HTMLButtonElement;
    buttontest.disabled = false;
    let buttontest2: HTMLButtonElement = UiElementHandler.stopSignalingServer as HTMLButtonElement;
    buttontest2.disabled = true;
    let buttontest3: HTMLButtonElement = UiElementHandler.switchModeButton as HTMLButtonElement;
    buttontest3.disabled = false;
}
function connectToSignalingServer(): void {
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
