"use strict";
exports.__esModule = true;
var EnumeratorCollection_1 = require("./../DataCollectors/Enumerators/EnumeratorCollection");
var MessageCandidate = /** @class */ (function () {
    function MessageCandidate(_userNameToConnectTo, _candidate) {
        this.messageType = EnumeratorCollection_1.MESSAGE_TYPE.RTC_CANDIDATE;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.candidate = _candidate;
    }
    return MessageCandidate;
}());
exports.MessageCandidate = MessageCandidate;
