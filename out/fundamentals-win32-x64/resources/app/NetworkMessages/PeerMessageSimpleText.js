"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    class PeerMessageSimpleText {
        constructor(_originatorId, _messageData) {
            this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TEXT_MESSAGE;
            this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.UNDEFINED;
            this.originatorId = _originatorId;
            this.messageData = _messageData;
        }
    }
    FudgeNetwork.PeerMessageSimpleText = PeerMessageSimpleText;
})(FudgeNetwork || (FudgeNetwork = {}));
