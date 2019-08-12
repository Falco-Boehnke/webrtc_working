System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, RtcAnswer;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            RtcAnswer = class RtcAnswer {
                constructor(_originatorId, _targetId, _userNameToConnectTo, _answer) {
                    this.messageType = TYPES.MESSAGE_TYPE.RTC_ANSWER;
                    this.originatorId = _originatorId;
                    this.targetId = _targetId;
                    this.answer = _answer;
                }
            };
            exports_1("RtcAnswer", RtcAnswer);
        }
    };
});
