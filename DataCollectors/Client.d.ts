import { ServerRoom } from "./ServerRoom";
export declare class Client {
    clientConnection: WebSocket | null;
    id: string;
    userName: string;
    connectedRoom: ServerRoom | null;
    constructor(websocketConnection?: WebSocket, uniqueClientId?: string, loginName?: string, connectedToRoom?: ServerRoom);
}
