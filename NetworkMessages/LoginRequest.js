System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, LoginRequest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            LoginRequest = class LoginRequest {
                constructor(_originatorId, _loginUserName) {
                    this.messageType = TYPES.MESSAGE_TYPE.LOGIN_REQUEST;
                    this.loginUserName = "";
                    this.loginUserName = _loginUserName;
                    this.originatorId = _originatorId;
                }
            };
            exports_1("LoginRequest", LoginRequest);
        }
    };
});
