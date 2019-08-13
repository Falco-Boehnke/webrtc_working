"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var NetworkMessages;
(function (NetworkMessages) {
    class IceCandidate {
        constructor(_originatorId, _targetId, _candidate) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE;
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.candidate = _candidate;
        }
    }
    NetworkMessages.IceCandidate = IceCandidate;
})(NetworkMessages || (NetworkMessages = {}));
