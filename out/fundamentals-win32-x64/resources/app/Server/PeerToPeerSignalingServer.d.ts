import WebSocket from "ws";
export declare class PeerToPeerSignalingServer {
    static websocketServer: WebSocket.Server;
    static connectedClientsCollection: FudgeNetwork.Client[];
    static startUpServer: (_serverPort?: number | undefined) => void;
    static closeDownServer: () => void;
    static serverEventHandler: () => void;
    static serverHandleMessageType(_message: string, _websocketClient: WebSocket): void;
    static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.NetworkMessageLoginRequest): void;
    static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void;
    static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void;
    static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void;
    static searchForClientWithId(_idToFind: string): FudgeNetwork.Client;
    static createID: () => string;
    static parseMessageToJson(_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase;
    static sendTo: (_connection: any, _message: Object) => void;
    private static searchForPropertyValueInCollection;
    private static searchUserByUserNameAndReturnUser;
    private static searchUserByUserIdAndReturnUser;
    private static searchUserByWebsocketConnectionAndReturnUser;
}
