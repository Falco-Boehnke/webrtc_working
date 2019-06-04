"use strict";
exports.__esModule = true;
var Message_Base_1 = require("./Message_Base");
var MessageLoginRequest = /** @class */ (function () {
    function MessageLoginRequest(loginUserName) {
        this.messageType = Message_Base_1.MessageType.LOGIN;
        this.loginUserName = "";
        this.loginUserName = loginUserName;
    }
    return MessageLoginRequest;
}());
exports.MessageLoginRequest = MessageLoginRequest;
