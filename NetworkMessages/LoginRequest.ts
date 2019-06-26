/// <reference path = "./MessageBase.ts" />
namespace NetworkMessages {

    export class LoginRequest implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.LOGIN;
        public loginUserName: string = "";

        constructor(_loginUserName: string) {
            this.loginUserName = _loginUserName;
        }

    }
}