import { IMessage_Base, MessageType } from "./Message_Base";

export class MessageCandidate implements IMessage_Base {
    
    public messageType: import("./Message_Base").MessageType = MessageType.RTC_CANDIDATE;
    public userNameToConnectTo: string;
    public candidate: string;
    constructor(userNameToConnectTo: string, candidate: string)
    {
        this.userNameToConnectTo = userNameToConnectTo;
        this.candidate = candidate;
    }







}