import WebSocket from "ws";
export declare class AuthoritativeSignalingServer {
    static websocketServer: WebSocket.Server;
    static connectedClientsCollection: FudgeNetwork.Client[];
    static authoritativeServerEntity: FudgeNetwork.AuthoritativeServerEntity;
    static startUpServer: (_serverPort?: number | undefined) => void;
    static closeDownServer: () => void;
    static serverEventHandler: () => void;
    static serverHandleMessageType(_message: string, _websocketClient: WebSocket): void;
    static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.LoginRequest): void;
    static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.RtcOffer): void;
    static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.RtcAnswer): void;
    static sendIceCandidatesToRelevantPeers(_messageData: FudgeNetwork.IceCandidate): void;
    static searchForClientWithId(_idToFind: string): FudgeNetwork.Client;
    static createID: () => string;
    static parseMessageToJson(_messageToParse: string): FudgeNetwork.MessageBase;
    static sendTo: (_connection: any, _message: Object) => void;
    static sendToId: (_clientId: string, _message: Object) => void;
    private static searchForPropertyValueInCollection;
    private static searchUserByUserNameAndReturnUser;
    private static searchUserByUserIdAndReturnUser;
    private static searchUserByWebsocketConnectionAndReturnUser;
}
