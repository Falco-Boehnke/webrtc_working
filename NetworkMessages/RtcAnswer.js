"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TYPES = __importStar(require("./../DataCollectors/Enumerators/EnumeratorCollection"));
class RtcAnswer {
    constructor(_originatorId, _targetId, _userNameToConnectTo, _answer) {
        this.messageType = TYPES.MESSAGE_TYPE.RTC_ANSWER;
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.answer = _answer;
    }
}
exports.RtcAnswer = RtcAnswer;
