"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    class NetworkMessageIdAssigned {
        constructor(_assignedId) {
            this.originatorId = "Server";
            this.messageType = NetworkTypes.MESSAGE_TYPE.ID_ASSIGNED;
            this.assignedId = _assignedId;
        }
    }
    FudgeNetwork.NetworkMessageIdAssigned = NetworkMessageIdAssigned;
    class NetworkMessageLoginRequest {
        constructor(_originatorId, _loginUserName) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.LOGIN_REQUEST;
            this.loginUserName = "";
            this.loginUserName = _loginUserName;
            this.originatorId = _originatorId;
        }
    }
    FudgeNetwork.NetworkMessageLoginRequest = NetworkMessageLoginRequest;
    class NetworkMessageLoginResponse {
        constructor(_loginSuccess, _assignedId, _originatorUsername) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.LOGIN_RESPONSE;
            this.loginSuccess = _loginSuccess;
            this.originatorId = _assignedId;
            this.originatorUsername = _originatorUsername;
        }
    }
    FudgeNetwork.NetworkMessageLoginResponse = NetworkMessageLoginResponse;
    class NetworkMessageRtcOffer {
        constructor(_originatorId, _userNameToConnectTo, _offer) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.RTC_OFFER;
            this.originatorId = _originatorId;
            this.userNameToConnectTo = _userNameToConnectTo;
            this.offer = _offer;
        }
    }
    FudgeNetwork.NetworkMessageRtcOffer = NetworkMessageRtcOffer;
    class NetworkMessageRtcAnswer {
        constructor(_originatorId, _targetId, _userNameToConnectTo, _answer) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.RTC_ANSWER;
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.answer = _answer;
        }
    }
    FudgeNetwork.NetworkMessageRtcAnswer = NetworkMessageRtcAnswer;
    class NetworkMessageIceCandidate {
        constructor(_originatorId, _targetId, _candidate) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE;
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.candidate = _candidate;
        }
    }
    FudgeNetwork.NetworkMessageIceCandidate = NetworkMessageIceCandidate;
})(FudgeNetwork || (FudgeNetwork = {}));
