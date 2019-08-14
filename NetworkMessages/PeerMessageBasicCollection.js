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
    class PeerMessageDisconnectClient {
        constructor(_originatorId) {
            this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
            this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;
            this.originatorId = _originatorId;
        }
    }
    FudgeNetwork.PeerMessageDisconnectClient = PeerMessageDisconnectClient;
    class PeerMessageKeysInput {
        constructor(_originatorId, _pressedKeycode, _pressedKeyCodes) {
            this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
            this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT;
            this.originatorId = _originatorId;
            this.pressedKey = _pressedKeycode;
            if (_pressedKeyCodes) {
                this.pressedKeys = _pressedKeyCodes;
            }
            else {
                this.pressedKeys = null;
            }
        }
    }
    FudgeNetwork.PeerMessageKeysInput = PeerMessageKeysInput;
})(FudgeNetwork || (FudgeNetwork = {}));
