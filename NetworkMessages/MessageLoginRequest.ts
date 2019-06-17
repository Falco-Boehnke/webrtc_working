import { MessageBase } from "./MessageBase";
import {MESSAGE_TYPE} from "./../DataCollectors/Enumerators/EnumeratorCollection";

export class MessageLoginRequest implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.LOGIN;
        public loginUserName: string = "";

        constructor(_loginUserName: string) {
            this.loginUserName = _loginUserName;
        }

    }
