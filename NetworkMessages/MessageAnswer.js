"use strict";
exports.__esModule = true;
var EnumeratorCollection_1 = require("./../DataCollectors/Enumerators/EnumeratorCollection");
var MessageAnswer = /** @class */ (function () {
    function MessageAnswer(_userNameToConnectTo, _answer) {
        this.messageType = EnumeratorCollection_1.MESSAGE_TYPE.RTC_ANSWER;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.answer = _answer;
    }
    return MessageAnswer;
}());
exports.MessageAnswer = MessageAnswer;
