import { MESSAGE_TYPE, MessageBase } from "./MessageBase";

export class MessageCandidate implements MessageBase {

    public messageType: import("./MessageBase").MESSAGE_TYPE = MESSAGE_TYPE.RTC_CANDIDATE;
    public userNameToConnectTo: string;
    public candidate: RTCIceCandidate;
    constructor(userNameToConnectTo: string, candidate: RTCIceCandidate) {
        this.userNameToConnectTo = userNameToConnectTo;
        this.candidate = candidate;
    }

}
