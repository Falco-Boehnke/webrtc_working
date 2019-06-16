export namespace Messages {

    export enum MESSAGE_TYPE {
        UNDEFINED = "undefined",
        LOGIN = "login",
        RTC_OFFER = "offer",
        RTC_ANSWER = "answer",
        RTC_CANDIDATE = "candidate",
    }

    export interface MessageBase {

        messageType: MESSAGE_TYPE;

    }


    export class IceCandidate implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.RTC_CANDIDATE;
        public userNameToConnectTo: string;
        public candidate: RTCIceCandidate;
        constructor(userNameToConnectTo: string, candidate: RTCIceCandidate) {
            this.userNameToConnectTo = userNameToConnectTo;
            this.candidate = candidate;
        }

    }


    export class AnswerToOffer implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.RTC_ANSWER;
        public userNameToConnectTo: string;
        public answer: RTCSessionDescription | null;
        constructor(userNameToConnectTo: string, _answer: RTCSessionDescription | null) {
            this.userNameToConnectTo = userNameToConnectTo;
            this.answer = _answer;

        }

    }



    export class LoginRequest implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.LOGIN;
        public loginUserName: string = "";

        constructor(loginUserName: string) {
            this.loginUserName = loginUserName;
        }

    }

    export class Offer implements MessageBase {

        public messageType: MESSAGE_TYPE = MESSAGE_TYPE.RTC_OFFER;
        public userNameToConnectTo: string;
        public offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
        constructor(userNameToConnectTo: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null) {
            this.userNameToConnectTo = userNameToConnectTo;
            this.offer = offer;
        }

    }

}
