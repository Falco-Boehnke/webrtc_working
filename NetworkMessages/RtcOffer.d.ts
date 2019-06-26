/// <reference path="MessageBase.d.ts" />
declare namespace NetworkMessages {
    class RtcOffer implements MessageBase {
        messageType: MESSAGE_TYPE;
        userNameToConnectTo: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
        constructor(_userNameToConnectTo: string, _offer: RTCSessionDescription | RTCSessionDescriptionInit | null);
    }
}
