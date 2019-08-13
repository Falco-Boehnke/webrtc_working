"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var NetworkMessages;
(function (NetworkMessages) {
    class LoginResponse {
        constructor(_loginSuccess, _assignedId, _originatorUsername) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.LOGIN_RESPONSE;
            this.loginSuccess = _loginSuccess;
            this.originatorId = _assignedId;
            this.originatorUsername = _originatorUsername;
        }
    }
    NetworkMessages.LoginResponse = LoginResponse;
})(NetworkMessages || (NetworkMessages = {}));
