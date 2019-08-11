import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class RtcAnswer implements MessageBase {

    public originatorId: string;
    public targetId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.RTC_ANSWER;

    public answer: RTCSessionDescription;

    constructor(_originatorId: string, _targetId: string, _userNameToConnectTo: string, _answer: RTCSessionDescription) {
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.answer = _answer;

    }

}
