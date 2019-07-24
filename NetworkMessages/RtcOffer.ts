import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class RtcOffer implements MessageBase {

    public originatorId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.RTC_OFFER;
    public userNameToConnectTo: string;
    public offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
    constructor(_originatorId: string, _userNameToConnectTo: string, _offer: RTCSessionDescription | RTCSessionDescriptionInit | null) {
        this.originatorId = _originatorId;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.offer = _offer;
    }

}
