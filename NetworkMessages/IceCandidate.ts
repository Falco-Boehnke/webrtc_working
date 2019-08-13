namespace FudgeNetwork {
    export class IceCandidate implements MessageBase {

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