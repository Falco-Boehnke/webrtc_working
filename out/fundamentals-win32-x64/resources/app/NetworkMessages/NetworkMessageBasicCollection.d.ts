declare namespace FudgeNetwork {
    interface NetworkMessageMessageBase {
        readonly messageType: FudgeNetwork.MESSAGE_TYPE;
        readonly originatorId: string;
    }
    class NetworkMessageIdAssigned implements NetworkMessageMessageBase {
        originatorId: string;
        assignedId: string;
        messageType: FudgeNetwork.MESSAGE_TYPE;
        constructor(_assignedId: string);
    }
    class NetworkMessageLoginRequest implements NetworkMessageMessageBase {
        originatorId: string;
        messageType: FudgeNetwork.MESSAGE_TYPE;
        loginUserName: string;
        constructor(_originatorId: string, _loginUserName: string);
    }
    class NetworkMessageLoginResponse implements NetworkMessageMessageBase {
        originatorId: string;
        originatorUsername: string;
        messageType: FudgeNetwork.MESSAGE_TYPE;
        loginSuccess: boolean;
        constructor(_loginSuccess: boolean, _assignedId: string, _originatorUsername: string);
    }
    class NetworkMessageRtcOffer implements NetworkMessageMessageBase {
        originatorId: string;
        messageType: FudgeNetwork.MESSAGE_TYPE;
        userNameToConnectTo: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
        constructor(_originatorId: string, _userNameToConnectTo: string, _offer: RTCSessionDescription | RTCSessionDescriptionInit | null);
    }
    class NetworkMessageRtcAnswer implements NetworkMessageMessageBase {
        originatorId: string;
        targetId: string;
        messageType: FudgeNetwork.MESSAGE_TYPE;
        answer: RTCSessionDescription;
        constructor(_originatorId: string, _targetId: string, _userNameToConnectTo: string, _answer: RTCSessionDescription);
    }
    class NetworkMessageIceCandidate implements NetworkMessageMessageBase {
        originatorId: string;
        targetId: string;
        messageType: FudgeNetwork.MESSAGE_TYPE;
        candidate: RTCIceCandidate;
        constructor(_originatorId: string, _targetId: string, _candidate: RTCIceCandidate);
    }
}
