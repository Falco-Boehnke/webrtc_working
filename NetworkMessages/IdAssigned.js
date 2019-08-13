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
class IdAssigned {
    // public messageType: NETWORKENUMS.MESSAGE_TYPE = NETWORKENUMS.MESSAGE_TYPE.ID_ASSIGNED;
    constructor(_assignedId) {
        this.originatorId = "Server";
        this.messageType = TYPES.MESSAGE_TYPE.ID_ASSIGNED;
        this.assignedId = _assignedId;
    }
}
exports.IdAssigned = IdAssigned;
