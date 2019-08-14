namespace FudgeNetwork {


    export interface PeerMessageTemplate {

        originatorId: string;
        messageType: MESSAGE_TYPE;
        commandType: SERVER_COMMAND_TYPE;

    }

    export class PeerMessageSimpleText implements PeerMessageTemplate {
        originatorId: string;
        messageType: MESSAGE_TYPE = MESSAGE_TYPE.PEER_TEXT_MESSAGE;
        commandType: SERVER_COMMAND_TYPE = SERVER_COMMAND_TYPE.UNDEFINED;

        messageData: string;

        constructor(_originatorId: string, _messageData: string) {
            this.originatorId = _originatorId;
            this.messageData = _messageData;
        }
    }

    export class PeerMessageDisconnectClient implements PeerMessageTemplate {
        originatorId: string;
        messageType: MESSAGE_TYPE = MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
        commandType: SERVER_COMMAND_TYPE = SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;

        constructor(_originatorId: string) {
            this.originatorId = _originatorId;
        }
    }

    export class PeerMessageKeysInput implements PeerMessageTemplate {
        originatorId: string;
        messageType: MESSAGE_TYPE = MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
        commandType: SERVER_COMMAND_TYPE = SERVER_COMMAND_TYPE.KEYS_INPUT;

        pressedKey: number;
        pressedKeys: number[] | null;

        constructor(_originatorId: string, _pressedKeycode: number, _pressedKeyCodes?: number[]) {
            this.originatorId = _originatorId;
            this.pressedKey = _pressedKeycode;
            if (_pressedKeyCodes) {
                this.pressedKeys = _pressedKeyCodes;
            }
            else { this.pressedKeys = null; }
        }
    }

}