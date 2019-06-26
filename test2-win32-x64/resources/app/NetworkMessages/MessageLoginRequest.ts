import { IMessage_Base, MessageType } from "./Message_Base";

export class MessageLoginRequest implements IMessage_Base {
    
    public messageType: import("./Message_Base").MessageType = MessageType.LOGIN;

    public loginUserName: string = "";
    constructor(loginUserName)
    {
        this.loginUserName = loginUserName;
    }







}