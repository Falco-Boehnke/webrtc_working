"use strict";
exports.__esModule = true;
var Message_Base_1 = require("./Message_Base");
var MessageCandidate = /** @class */ (function () {
    function MessageCandidate(userNameToConnectTo, candidate) {
        this.messageType = Message_Base_1.MessageType.RTC_CANDIDATE;
        this.userNameToConnectTo = userNameToConnectTo;
        this.candidate = candidate;
    }
    return MessageCandidate;
}());
exports.MessageCandidate = MessageCandidate;
