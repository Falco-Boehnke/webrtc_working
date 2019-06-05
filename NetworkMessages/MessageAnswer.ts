import { MESSAGE_TYPE, MessageBase } from "./MessageBase";

export class MessageAnswer implements MessageBase {

    public messageType: import("./MessageBase").MESSAGE_TYPE = MESSAGE_TYPE.RTC_ANSWER;
    public userNameToConnectTo: string;
    public answer: any;
    constructor(userNameToConnectTo: string, _answer: RTCSessionDescriptionInit | RTCOfferOptions) {
        this.userNameToConnectTo = userNameToConnectTo;

    }

}
