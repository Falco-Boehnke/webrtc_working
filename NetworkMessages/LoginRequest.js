"use strict";
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
(function (NetworkMessages) {
    class LoginRequest {
        constructor(_loginUserName) {
            this.messageType = MESSAGE_TYPE.LOGIN;
            this.loginUserName = "";
            this.loginUserName = _loginUserName;
        }
    }
    NetworkMessages.LoginRequest = LoginRequest;
})(NetworkMessages || (NetworkMessages = {}));
