namespace NetworkMessages {

    export class MessageLoginRequest implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.LOGIN;
        public loginUserName: string = "";

        constructor(loginUserName: string) {
            this.loginUserName = loginUserName;
        }

    }
}