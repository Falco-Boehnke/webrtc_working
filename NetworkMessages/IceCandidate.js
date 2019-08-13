"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    class IceCandidate {
        constructor(_originatorId, _targetId, _candidate) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE;
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.candidate = _candidate;
        }
    }
    FudgeNetwork.IceCandidate = IceCandidate;
})(FudgeNetwork || (FudgeNetwork = {}));
