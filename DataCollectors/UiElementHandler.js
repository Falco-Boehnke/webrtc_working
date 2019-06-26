"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UiElementHandler {
    static getAllUiElements() {
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri");
        UiElementHandler.signalingSubmit = document.getElementById("submit_button");
        UiElementHandler.loginNameInput = document.getElementById("login_name");
        UiElementHandler.loginButton = document.getElementById("login_button");
        console.log("UI ELEMENT HANDLER LOGIC: ", UiElementHandler.loginButton);
        UiElementHandler.msgInput = document.getElementById("msgInput");
        UiElementHandler.chatbox = document.getElementById("chatbox");
        UiElementHandler.sendMsgButton = document.getElementById("sendMessage");
        UiElementHandler.connectToUserButton = document.getElementById("userConnect");
        UiElementHandler.usernameToConnectTo = document.getElementById("connectToUsername");
        UiElementHandler.disconnectButton = document.getElementById("disconnectBtn");
    }
}
exports.UiElementHandler = UiElementHandler;
