System.register([], function (exports_1, context_1) {
    "use strict";
    var MESSAGE_TYPE, TEST_ENUM;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            (function (MESSAGE_TYPE) {
                MESSAGE_TYPE["UNDEFINED"] = "undefined";
                MESSAGE_TYPE["ID_ASSIGNED"] = "id_assigned";
                MESSAGE_TYPE["LOGIN_REQUEST"] = "login_request";
                MESSAGE_TYPE["LOGIN_RESPONSE"] = "login_response";
                MESSAGE_TYPE["RTC_OFFER"] = "offer";
                MESSAGE_TYPE["RTC_ANSWER"] = "answer";
                MESSAGE_TYPE["ICE_CANDIDATE"] = "candidate";
                MESSAGE_TYPE["SERVER_ASSIGNMENT_REQUEST"] = "server_assignment_request";
            })(MESSAGE_TYPE || (MESSAGE_TYPE = {}));
            exports_1("MESSAGE_TYPE", MESSAGE_TYPE);
            (function (TEST_ENUM) {
                TEST_ENUM["SERIOUSLY"] = "wtf";
            })(TEST_ENUM || (TEST_ENUM = {}));
        }
    };
});
