/// <reference path="MessageBase.d.ts" />
declare namespace NetworkMessages {
    class RtcAnswer implements MessageBase {
        messageType: MESSAGE_TYPE;
        userNameToConnectTo: string;
        answer: RTCSessionDescription | null;
        constructor(_userNameToConnectTo: string, _answer: RTCSessionDescription | null);
    }
}
