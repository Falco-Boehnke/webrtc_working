"use strict";
/// <reference path = "./MessageBase.ts" />
var NetworkMessages;
(function (NetworkMessages) {
    class RtcOffer {
        constructor(_userNameToConnectTo, _offer) {
            this.messageType = MESSAGE_TYPE.RTC_OFFER;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.offer = _offer;
        }
    }
    NetworkMessages.RtcOffer = RtcOffer;
})(NetworkMessages || (NetworkMessages = {}));
