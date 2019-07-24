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
class IceCandidate {
    constructor(_originatorId, _targetId, _candidate) {
        this.messageType = TYPES.MESSAGE_TYPE.ICE_CANDIDATE;
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.candidate = _candidate;
    }
}
exports.IceCandidate = IceCandidate;
