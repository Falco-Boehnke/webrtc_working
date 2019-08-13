// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
namespace NetworkMessages {
    export class RtcAnswer implements NetworkMessages.MessageBase {

        public originatorId: string;
        public targetId: string;
        public messageType: NetworkTypes.MESSAGE_TYPE = NetworkTypes.MESSAGE_TYPE.RTC_ANSWER;

        public answer: RTCSessionDescription;

        constructor(_originatorId: string, _targetId: string, _userNameToConnectTo: string, _answer: RTCSessionDescription) {
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.answer = _answer;

        }

    }
}
