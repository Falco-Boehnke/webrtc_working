"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var NetworkMessages;
(function (NetworkMessages) {
    class RtcAnswer {
        constructor(_originatorId, _targetId, _userNameToConnectTo, _answer) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.RTC_ANSWER;
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.answer = _answer;
        }
    }
    NetworkMessages.RtcAnswer = RtcAnswer;
})(NetworkMessages || (NetworkMessages = {}));
