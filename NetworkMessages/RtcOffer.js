System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, RtcOffer;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            RtcOffer = class RtcOffer {
                constructor(_originatorId, _userNameToConnectTo, _offer) {
                    this.messageType = TYPES.MESSAGE_TYPE.RTC_OFFER;
                    this.originatorId = _originatorId;
                    this.userNameToConnectTo = _userNameToConnectTo;
                    this.offer = _offer;
                }
            };
            exports_1("RtcOffer", RtcOffer);
        }
    };
});
