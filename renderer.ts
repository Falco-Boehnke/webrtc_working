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
UiElementHandler.broadcastButton.addEventListener("click", broadcastMessageToClients);

function broadcastMessageToClients(){
    AuthoritativeSignalingServer.authoritativeServerEntity.broadcastMessageToAllConnectedClients("TEST");
}


function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = UiElementHandler.switchModeButton as HTMLButtonElement;
    if (!asMode) {
        switchbutton.textContent = "Switch To P2P Mode";
        UiElementHandler.peerToPeerHtmlElements.style.display = "none";
        UiElementHandler.authoritativeElements.style.display = "block";
        asMode = true;
    }
    else {
        switchbutton.textContent = "Switch To Authoritative Mode";
        UiElementHandler.peerToPeerHtmlElements.style.display = "block";
        UiElementHandler.authoritativeElements.style.display = "none";
        asMode = false;
    }
}



function startingUpSignalingServer(): void {
    console.log("Turning server ONLINE");
    if (asMode) {
        AuthoritativeSignalingServer.startUpServer(9090);
    }
    else {
        PeerToPeerSignalingServer.startUpServer(9090);
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

    let startSignalingButton: HTMLButtonElement = UiElementHandler.startSignalingButton as HTMLButtonElement;
    startSignalingButton.disabled = false;
    let stopSignalingButton: HTMLButtonElement = UiElementHandler.stopSignalingServer as HTMLButtonElement;
    stopSignalingButton.disabled = true;
    let switchButton: HTMLButtonElement = UiElementHandler.switchModeButton as HTMLButtonElement;
    switchButton.disabled = false;
}
function connectToSignalingServer(): void {
    test.signalingServerUrl = "ws://" + UiElementHandler.signalingUrl.value;
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
