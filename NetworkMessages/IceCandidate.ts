import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class IceCandidate implements MessageBase {

    public originatorId: string;
    public targetId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.ICE_CANDIDATE;
    // public messageType: NETWORKENUMS.MESSAGE_TYPE = NETWORKENUMS.MESSAGE_TYPE.ICE_CANDIDATE;
    public candidate: RTCIceCandidate;
    constructor(_originatorId: string, _targetId: string, _candidate: RTCIceCandidate) {
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.candidate = _candidate;
    }

}
