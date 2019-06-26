"use strict";
exports.__esModule = true;
var Message_Base_1 = require("./Message_Base");
var MessageOffer = /** @class */ (function () {
    function MessageOffer(userNameToConnectTo, offer) {
        this.messageType = Message_Base_1.MessageType.RTC_OFFER;
        this.userNameToConnectTo = userNameToConnectTo;
        this.offer = offer;
    }
    return MessageOffer;
}());
exports.MessageOffer = MessageOffer;
