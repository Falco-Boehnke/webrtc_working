import { MESSAGE_TYPE, MessageBase } from "./MessageBase";

export class MessageOffer implements MessageBase {

    public messageType: import("./MessageBase").MESSAGE_TYPE = MESSAGE_TYPE.RTC_OFFER;
    public userNameToConnectTo: string;
    public offer: RTCSessionDescriptionInit;
    constructor(userNameToConnectTo: string, offer: RTCSessionDescriptionInit) {
        this.userNameToConnectTo = userNameToConnectTo;
        this.offer = offer;
    }

}
