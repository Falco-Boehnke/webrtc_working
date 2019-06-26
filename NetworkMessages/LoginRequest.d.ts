/// <reference path="MessageBase.d.ts" />
declare namespace NetworkMessages {
    class LoginRequest implements MessageBase {
        messageType: MESSAGE_TYPE;
        loginUserName: string;
        constructor(_loginUserName: string);
    }
}
