import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class LoginResponse implements MessageBase {
    public originatorId: string;
    public originatorUsername: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.LOGIN_RESPONSE;
    // public messageType: NETWORKENUMS.MESSAGE_TYPE = NETWORKENUMS.MESSAGE_TYPE.LOGIN_RESPONSE;
    public loginSuccess: boolean;


    constructor(_loginSuccess: boolean, _assignedId: string, _originatorUsername: string) {
        this.loginSuccess = _loginSuccess;
        this.originatorId = _assignedId;
        this.originatorUsername = _originatorUsername;

    }

}
