"use strict";
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
(function (NetworkMessages) {
    class RtcAnswer {
        constructor(_userNameToConnectTo, _answer) {
            this.messageType = MESSAGE_TYPE.RTC_ANSWER;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.answer = _answer;
        }
    }
    NetworkMessages.RtcAnswer = RtcAnswer;
})(NetworkMessages || (NetworkMessages = {}));
