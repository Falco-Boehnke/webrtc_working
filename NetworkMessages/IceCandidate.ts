import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class IceCandidate implements MessageBase {

    public originatorId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.RTC_CANDIDATE;
    public userNameToConnectTo: string;
    public candidate: RTCIceCandidate;
    constructor(_originatorId: string, _userNameToConnectTo: string, _candidate: RTCIceCandidate) {
        this.originatorId = _originatorId;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.candidate = _candidate;
    }

}
