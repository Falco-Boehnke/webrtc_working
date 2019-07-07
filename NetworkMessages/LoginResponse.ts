import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class LoginResponse implements MessageBase {

    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.LOGIN;
    public loginSuccess: boolean;
    public assignedId: string;

    constructor(_loginSuccess: boolean, _assignedId: string) {
        this.loginSuccess = _loginSuccess;
        this.assignedId = _assignedId;
    }

}
