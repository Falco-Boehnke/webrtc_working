// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
namespace NetworkMessages {
    export class LoginResponse implements NetworkMessages.MessageBase {
        public originatorId: string;
        public originatorUsername: string;
        public messageType: NetworkTypes.MESSAGE_TYPE = NetworkTypes.MESSAGE_TYPE.LOGIN_RESPONSE;
        public loginSuccess: boolean;


        constructor(_loginSuccess: boolean, _assignedId: string, _originatorUsername: string) {
            this.loginSuccess = _loginSuccess;
            this.originatorId = _assignedId;
            this.originatorUsername = _originatorUsername;

        }

    }
}