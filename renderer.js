"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkConnectionManager_1 = require("./NetworkConnectionManager");
const UiElementHandler_1 = require("./DataCollectors/UiElementHandler");
UiElementHandler_1.UiElementHandler.getAllUiElements();
const test = new NetworkConnectionManager_1.NetworkConnectionManager();
