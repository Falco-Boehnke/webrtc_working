declare namespace FudgeNetwork {
    interface MessageBase {
        readonly messageType: NetworkTypes.MESSAGE_TYPE;
        readonly originatorId: string;
    }
    class IdAssigned implements MessageBase {
        originatorId: string;
        assignedId: string;
        messageType: NetworkTypes.MESSAGE_TYPE;
        constructor(_assignedId: string);
    }
    class LoginRequest implements MessageBase {
        originatorId: string;
        messageType: NetworkTypes.MESSAGE_TYPE;
        loginUserName: string;
        constructor(_originatorId: string, _loginUserName: string);
    }
    class LoginResponse implements MessageBase {
        originatorId: string;
        originatorUsername: string;
        messageType: NetworkTypes.MESSAGE_TYPE;
        loginSuccess: boolean;
        constructor(_loginSuccess: boolean, _assignedId: string, _originatorUsername: string);
    }
    class RtcOffer implements MessageBase {
        originatorId: string;
        messageType: NetworkTypes.MESSAGE_TYPE;
        userNameToConnectTo: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
        constructor(_originatorId: string, _userNameToConnectTo: string, _offer: RTCSessionDescription | RTCSessionDescriptionInit | null);
    }
    class RtcAnswer implements MessageBase {
        originatorId: string;
        targetId: string;
        messageType: NetworkTypes.MESSAGE_TYPE;
        answer: RTCSessionDescription;
        constructor(_originatorId: string, _targetId: string, _userNameToConnectTo: string, _answer: RTCSessionDescription);
    }
    class IceCandidate implements MessageBase {
        originatorId: string;
        targetId: string;
        messageType: NetworkTypes.MESSAGE_TYPE;
        candidate: RTCIceCandidate;
        constructor(_originatorId: string, _targetId: string, _candidate: RTCIceCandidate);
    }
}
