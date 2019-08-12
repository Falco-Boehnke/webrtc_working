System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, IceCandidate;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            IceCandidate = class IceCandidate {
                constructor(_originatorId, _targetId, _candidate) {
                    this.messageType = TYPES.MESSAGE_TYPE.ICE_CANDIDATE;
                    this.originatorId = _originatorId;
                    this.targetId = _targetId;
                    this.candidate = _candidate;
                }
            };
            exports_1("IceCandidate", IceCandidate);
        }
    };
});
