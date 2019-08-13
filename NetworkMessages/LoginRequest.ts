// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
namespace FudgeNetwork {
    export class LoginRequest implements MessageBase {
        public originatorId: string;
        public messageType: NetworkTypes.MESSAGE_TYPE = NetworkTypes.MESSAGE_TYPE.LOGIN_REQUEST;
        public loginUserName: string = "";

        constructor(_originatorId: string, _loginUserName: string) {
            this.loginUserName = _loginUserName;
            this.originatorId = _originatorId;
        }

    }
}