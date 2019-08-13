declare namespace FudgeNetwork {
    interface PeerMessageTemplate {
        originatorId: string;
        messageType: MESSAGE_TYPE;
        commandType: SERVER_COMMAND_TYPE;
    }
}
