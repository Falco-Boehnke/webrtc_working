"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var FudgeNetwork;
(function (FudgeNetwork) {
    class RtcOffer {
        constructor(_originatorId, _userNameToConnectTo, _offer) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.RTC_OFFER;
            this.originatorId = _originatorId;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.offer = _offer;
        }
    }
    FudgeNetwork.RtcOffer = RtcOffer;
})(FudgeNetwork || (FudgeNetwork = {}));
