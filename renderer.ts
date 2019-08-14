import * as FudgeNetwork from "./index";

let asMode: boolean = false;
const test: FudgeNetwork.NetworkConnectionManager = new FudgeNetwork.NetworkConnectionManager();


FudgeNetwork.UiElementHandler.getAllUiElements();
FudgeNetwork.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.loginButton.addEventListener("click", test.checkChosenUsernameAndCreateLoginRequest);
FudgeNetwork.UiElementHandler.connectToUserButton.addEventListener("click", test.checkUsernameToConnectToAndInitiateConnection);
FudgeNetwork.UiElementHandler.sendMsgButton.addEventListener("click", test.sendMessageViaDirectPeerConnection);
FudgeNetwork.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
FudgeNetwork.UiElementHandler.broadcastButton.addEventListener("click", broadcastMessageToClients);




function broadcastMessageToClients(): void {
    FudgeNetwork.AuthoritativeSignalingServer.authoritativeServerEntity.broadcastMessageToAllConnectedClients("TEST");
}



function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
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



function startingUpSignalingServer(): void {
    console.log("Turning server ONLINE");
    if (asMode) {
        FudgeNetwork.AuthoritativeSignalingServer.startUpServer(9090);
    }
    else {
        FudgeNetwork.PeerToPeerSignalingServer.startUpServer(9090);
    }
    let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.startSignalingButton as HTMLButtonElement;
    startSignalingButton.hidden = true;
    let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.stopSignalingServer as HTMLButtonElement;
    stopSignalingButton.hidden = false;
    let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
    switchButton.hidden = true;
}

function turnOffSignalingServer(): void {
    console.log("Turning server offline");
    if (asMode) {

        FudgeNetwork.AuthoritativeSignalingServer.closeDownServer();
    }
    else {
        FudgeNetwork.PeerToPeerSignalingServer.closeDownServer();
    }

    let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.startSignalingButton as HTMLButtonElement;
    startSignalingButton.hidden = false;
    let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.stopSignalingServer as HTMLButtonElement;
    stopSignalingButton.hidden = true;
    let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
    switchButton.hidden = false;
}
function connectToSignalingServer(): void {
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
