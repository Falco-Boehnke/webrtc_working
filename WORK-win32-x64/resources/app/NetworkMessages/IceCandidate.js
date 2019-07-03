"use strict";
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
(function (NetworkMessages) {
    class IceCandidate {
        constructor(_userNameToConnectTo, _candidate) {
            this.messageType = MESSAGE_TYPE.RTC_CANDIDATE;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.candidate = _candidate;
        }
    }
    NetworkMessages.IceCandidate = IceCandidate;
})(NetworkMessages || (NetworkMessages = {}));
