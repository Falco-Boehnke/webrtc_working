// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
namespace NetworkMessages {
    export class IceCandidate implements NetworkMessages.MessageBase {

        public originatorId: string;
        public targetId: string;
        public messageType: NetworkTypes.MESSAGE_TYPE = NetworkTypes.MESSAGE_TYPE.ICE_CANDIDATE;

        public candidate: RTCIceCandidate;
        constructor(_originatorId: string, _targetId: string, _candidate: RTCIceCandidate) {
            this.originatorId = _originatorId;
            this.targetId = _targetId;
            this.candidate = _candidate;
        }

    }
}