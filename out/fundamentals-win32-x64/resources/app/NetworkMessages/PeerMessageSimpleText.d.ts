declare namespace FudgeNetwork {
    class PeerMessageSimpleText implements PeerMessageTemplate {
        originatorId: string;
        messageType: MESSAGE_TYPE;
        commandType: SERVER_COMMAND_TYPE;
        messageData: string;
        constructor(_originatorId: string, _messageData: string);
    }
}
