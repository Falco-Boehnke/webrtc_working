import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { UiElementHandler } from "./DataCollectors/UiElementHandler";


UiElementHandler.getAllUiElements();
const test: NetworkConnectionManager = new NetworkConnectionManager();
test.createRTCPeerConnectionAndAddListeners();
test.addUiListeners();



UiElementHandler.startSignalingButton.addEventListener("click", startingUpServer);
UiElementHandler.signalingSubmit.addEventListener("click",connectToSignalingServer);
function startingUpServer() {
    if (test) {
        test.startUpSignalingServerFile("./Server/ServerMain");
    }
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
