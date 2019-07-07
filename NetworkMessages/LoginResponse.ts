import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class LoginResponse implements MessageBase {
    public originatorId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.LOGIN_RESPONSE;
    public loginSuccess: boolean;


    constructor(_loginSuccess: boolean, _assignedId: string) {
        this.loginSuccess = _loginSuccess;
        this.originatorId = _assignedId;
    }

}
