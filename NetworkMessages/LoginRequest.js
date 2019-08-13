"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var FudgeNetwork;
(function (FudgeNetwork) {
    class LoginRequest {
        constructor(_originatorId, _loginUserName) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.LOGIN_REQUEST;
            this.loginUserName = "";
            this.loginUserName = _loginUserName;
            this.originatorId = _originatorId;
        }
    }
    FudgeNetwork.LoginRequest = LoginRequest;
})(FudgeNetwork || (FudgeNetwork = {}));
