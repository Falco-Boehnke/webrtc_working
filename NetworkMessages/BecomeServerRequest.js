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
class BecomeServerRequest {
    // public messageType: NETWORKENUMS.MESSAGE_TYPE = NETWORKENUMS.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;
    constructor(_originatorId) {
        this.messageType = TYPES.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;
        this.originatorId = _originatorId;
    }
}
exports.BecomeServerRequest = BecomeServerRequest;
