import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class LoginRequest implements MessageBase {
    public originatorId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.LOGIN_REQUEST;
    public loginUserName: string = "";

    constructor(_originatorId: string, _loginUserName: string) {
        this.loginUserName = _loginUserName;
        this.originatorId = _originatorId;
    }

}
