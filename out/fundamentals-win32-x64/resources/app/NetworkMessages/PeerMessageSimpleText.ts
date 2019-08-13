namespace FudgeNetwork {

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
}