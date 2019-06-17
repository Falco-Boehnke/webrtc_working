"use strict";
exports.__esModule = true;
var EnumeratorCollection_1 = require("./../DataCollectors/Enumerators/EnumeratorCollection");
var MessageOffer = /** @class */ (function () {
    function MessageOffer(_userNameToConnectTo, _offer) {
        this.messageType = EnumeratorCollection_1.MESSAGE_TYPE.RTC_OFFER;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.offer = _offer;
    }
    return MessageOffer;
}());
exports.MessageOffer = MessageOffer;
