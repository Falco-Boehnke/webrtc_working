import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class RtcAnswer implements MessageBase {

    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.RTC_ANSWER;
    public userNameToConnectTo: string;
    public answer: RTCSessionDescription | null;

    constructor(_userNameToConnectTo: string, _answer: RTCSessionDescription | null) {
        this.userNameToConnectTo = _userNameToConnectTo;
        this.answer = _answer;

    }

}
