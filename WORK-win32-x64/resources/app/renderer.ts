import { NetworkConnectionManager } from "./NetworkConnectionManager";
import { UiElementHandler } from "./DataCollectors/UiElementHandler";

UiElementHandler.getAllUiElements();
console.log(document.getElementById("loginButton"));
const test = new NetworkConnectionManager();