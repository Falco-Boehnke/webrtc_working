System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, LoginResponse;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            LoginResponse = class LoginResponse {
                constructor(_loginSuccess, _assignedId, _originatorUsername) {
                    this.messageType = TYPES.MESSAGE_TYPE.LOGIN_RESPONSE;
                    this.loginSuccess = _loginSuccess;
                    this.originatorId = _assignedId;
                    this.originatorUsername = _originatorUsername;
                }
            };
            exports_1("LoginResponse", LoginResponse);
        }
    };
});
