"use strict";
exports.__esModule = true;
var EnumeratorCollection_1 = require("./../DataCollectors/Enumerators/EnumeratorCollection");
var MessageLoginRequest = /** @class */ (function () {
    function MessageLoginRequest(_loginUserName) {
        this.messageType = EnumeratorCollection_1.MESSAGE_TYPE.LOGIN;
        this.loginUserName = "";
        this.loginUserName = _loginUserName;
    }
    return MessageLoginRequest;
}());
exports.MessageLoginRequest = MessageLoginRequest;
