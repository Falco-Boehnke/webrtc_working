namespace NetworkMessages {

    export class MessageCandidate implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.RTC_CANDIDATE;
        public userNameToConnectTo: string;
        public candidate: RTCIceCandidate;
        constructor(userNameToConnectTo: string, candidate: RTCIceCandidate) {
            this.userNameToConnectTo = userNameToConnectTo;
            this.candidate = candidate;
        }

    }
}