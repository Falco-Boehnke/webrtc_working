import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { UiElementHandler } from "./DataCollectors/UiElementHandler";

UiElementHandler.getAllUiElements();
const test: NetworkConnectionManager = new NetworkConnectionManager();
test.createRTCPeerConnectionAndAddListeners();
test.addUiListeners();
// test.startUpSignalingServerFile("./Server/ServerMain");
test.connectToSpecifiedSignalingServer();