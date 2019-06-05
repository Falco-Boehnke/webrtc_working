import { MESSAGE_TYPE, MessageBase } from "./MessageBase";

export class MessageLoginRequest implements MessageBase {

    public messageType: import("./MessageBase").MESSAGE_TYPE = MESSAGE_TYPE.LOGIN;
    public loginUserName: string = "";

    constructor(loginUserName: string) {
        this.loginUserName = loginUserName;
    }

}
