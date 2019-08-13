"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    class LoginResponse {
        constructor(_loginSuccess, _assignedId, _originatorUsername) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.LOGIN_RESPONSE;
            this.loginSuccess = _loginSuccess;
            this.originatorId = _assignedId;
            this.originatorUsername = _originatorUsername;
        }
    }
    FudgeNetwork.LoginResponse = LoginResponse;
})(FudgeNetwork || (FudgeNetwork = {}));
