import { IMessage_Base, MessageType } from "./Message_Base";

export class MessageAnswer implements IMessage_Base {
    
    public messageType: import("./Message_Base").MessageType = MessageType.RTC_ANSWER;
    public userNameToConnectTo: string;
    public answer: string;
    constructor(userNameToConnectTo: string, answer: string)
    {
        this.userNameToConnectTo = userNameToConnectTo;
        this.answer = answer;
    }







}