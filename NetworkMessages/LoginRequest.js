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
class LoginRequest {
    constructor(_originatorId, _loginUserName) {
        this.messageType = TYPES.MESSAGE_TYPE.LOGIN_REQUEST;
        // public messageType: NETWORKENUMS.MESSAGE_TYPE = NETWORKENUMS.MESSAGE_TYPE.LOGIN_REQUEST;
        this.loginUserName = "";
        this.loginUserName = _loginUserName;
        this.originatorId = _originatorId;
    }
}
exports.LoginRequest = LoginRequest;
