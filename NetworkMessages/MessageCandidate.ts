import { MessageBase } from "./MessageBase";
import {MESSAGE_TYPE} from "./../DataCollectors/Enumerators/EnumeratorCollection";

export class MessageCandidate implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.RTC_CANDIDATE;
        public userNameToConnectTo: string;
        public candidate: RTCIceCandidate;
        constructor(_userNameToConnectTo: string, _candidate: RTCIceCandidate) {
            this.userNameToConnectTo = _userNameToConnectTo;
            this.candidate = _candidate;
        }

    }
