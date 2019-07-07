import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class RtcAnswer implements MessageBase {

    public originatorId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.RTC_ANSWER;
    public userNameToConnectTo: string;
    public answer: RTCSessionDescription | null;

    constructor(_originatorId: string, _userNameToConnectTo: string, _answer: RTCSessionDescription | null) {
        this.originatorId = _originatorId;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.answer = _answer;

    }

}
