/// <reference path="MessageBase.d.ts" />
declare namespace NetworkMessages {
    class IceCandidate implements MessageBase {
        messageType: MESSAGE_TYPE;
        userNameToConnectTo: string;
        candidate: RTCIceCandidate;
        constructor(_userNameToConnectTo: string, _candidate: RTCIceCandidate);
    }
}
