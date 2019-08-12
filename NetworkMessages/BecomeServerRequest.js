System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, BecomeServerRequest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            BecomeServerRequest = class BecomeServerRequest {
                constructor(_originatorId) {
                    this.messageType = TYPES.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;
                    this.originatorId = _originatorId;
                }
            };
            exports_1("BecomeServerRequest", BecomeServerRequest);
        }
    };
});
