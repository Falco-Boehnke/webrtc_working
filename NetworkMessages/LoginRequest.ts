import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class LoginRequest implements MessageBase {

    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.LOGIN;
    public loginUserName: string = "";

    constructor(_loginUserName: string) {
        this.loginUserName = _loginUserName;
    }

}
