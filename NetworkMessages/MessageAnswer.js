"use strict";
exports.__esModule = true;
var Message_Base_1 = require("./Message_Base");
var MessageAnswer = /** @class */ (function () {
    function MessageAnswer(userNameToConnectTo, answer) {
        this.messageType = Message_Base_1.MessageType.RTC_ANSWER;
        this.userNameToConnectTo = userNameToConnectTo;
        this.answer = answer;
    }
    return MessageAnswer;
}());
exports.MessageAnswer = MessageAnswer;
