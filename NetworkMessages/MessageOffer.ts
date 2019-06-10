import { MESSAGE_TYPE, MessageBase } from "./MessageBase";

export class MessageOffer implements MessageBase {

    public messageType: import("./MessageBase").MESSAGE_TYPE = MESSAGE_TYPE.RTC_OFFER;
    public userNameToConnectTo: string;
    public offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
    constructor(userNameToConnectTo: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null) {
        this.userNameToConnectTo = userNameToConnectTo;
        this.offer = offer;
    }

}
