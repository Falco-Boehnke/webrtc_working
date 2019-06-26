import { IMessage_Base, MessageType } from "./Message_Base";

export class MessageOffer implements IMessage_Base {
    
    public messageType: import("./Message_Base").MessageType = MessageType.RTC_OFFER;
    public userNameToConnectTo: string;
    public offer: string;
    constructor(userNameToConnectTo: string, offer: string)
    {
        this.userNameToConnectTo = userNameToConnectTo;
        this.offer = offer;
    }







}