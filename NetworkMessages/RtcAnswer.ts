/// <reference path = "./MessageBase.ts" />
namespace NetworkMessages {

    export class RtcAnswer implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.RTC_ANSWER;
        public userNameToConnectTo: string;
        public answer: RTCSessionDescription | null;

        constructor(_userNameToConnectTo: string, _answer: RTCSessionDescription | null) {
            this.userNameToConnectTo = _userNameToConnectTo;
            this.answer = _answer;

        }

    }
}