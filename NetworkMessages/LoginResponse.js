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
class LoginResponse {
    constructor(_loginSuccess, _assignedId, _originatorUsername) {
        this.messageType = TYPES.MESSAGE_TYPE.LOGIN_RESPONSE;
        this.loginSuccess = _loginSuccess;
        this.originatorId = _assignedId;
        this.originatorUsername = _originatorUsername;
    }
}
exports.LoginResponse = LoginResponse;
