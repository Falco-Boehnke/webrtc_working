declare module "NetworkMessages/MessageBase" {
    export enum MESSAGE_TYPE {
        UNDEFINED = "undefined",
        LOGIN = "login",
        RTC_OFFER = "offer",
        RTC_ANSWER = "answer",
        RTC_CANDIDATE = "candidate"
    }
    export interface MessageBase {
        messageType: MESSAGE_TYPE;
    }
}
declare module "NetworkMessages/MessageAnswer" {
    import { MessageBase } from "NetworkMessages/MessageBase";
    export class MessageAnswer implements MessageBase {
        messageType: import("NetworkMessages/MessageBase").MESSAGE_TYPE;
        userNameToConnectTo: string;
        answer: RTCSessionDescription | null;
        constructor(userNameToConnectTo: string, _answer: RTCSessionDescription | null);
    }
}
declare module "NetworkMessages/MessageCandidate" {
    import { MessageBase } from "NetworkMessages/MessageBase";
    export class MessageCandidate implements MessageBase {
        messageType: import("NetworkMessages/MessageBase").MESSAGE_TYPE;
        userNameToConnectTo: string;
        candidate: RTCIceCandidate;
        constructor(userNameToConnectTo: string, candidate: RTCIceCandidate);
    }
}
declare module "NetworkMessages/MessageLoginRequest" {
    import { MessageBase } from "NetworkMessages/MessageBase";
    export class MessageLoginRequest implements MessageBase {
        messageType: import("NetworkMessages/MessageBase").MESSAGE_TYPE;
        loginUserName: string;
        constructor(loginUserName: string);
    }
}
declare module "NetworkMessages/MessageOffer" {
    import { MessageBase } from "NetworkMessages/MessageBase";
    export class MessageOffer implements MessageBase {
        messageType: import("NetworkMessages/MessageBase").MESSAGE_TYPE;
        userNameToConnectTo: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
        constructor(userNameToConnectTo: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null);
    }
}
declare module "UiElementHandler" {
    export abstract class UiElementHandler {
        static signalingSubmit: HTMLElement;
        static signalingUrl: HTMLInputElement;
        static loginNameInput: HTMLElement;
        static loginButton: HTMLElement;
        static msgInput: HTMLInputElement;
        static chatbox: HTMLInputElement;
        static sendMsgButton: HTMLElement;
        static connectToUserButton: HTMLElement;
        static usernameToConnectTo: HTMLInputElement;
        static disconnectButton: HTMLElement;
        static getAllUiElements(): void;
    }
}
declare module "NetworkConnectionManager" {
    export class NetworkConnectionManager {
        ws: WebSocket;
        username: string;
        connection: RTCPeerConnection;
        otherUsername: string;
        peerConnection: RTCDataChannel;
        configuration: {
            iceServers: {
                urls: string;
            }[];
        };
        constructor();
        addUiListeners: () => void;
        addWsEventListeners: () => void;
        handleCandidate: (candidate: RTCIceCandidateInit | undefined) => void;
        handleAnswer: (answer: RTCSessionDescriptionInit) => void;
        handleOffer: (offer: RTCSessionDescriptionInit, username: string) => void;
        handleLogin: (loginSuccess: boolean) => void;
        loginLogic: () => void;
        createRTCConnection: () => void;
        connectToUser: () => void;
        createRtcOffer: (userNameForOffer: string) => void;
        sendMessage: (message: Object) => void;
        sendMessageToUser: () => void;
    }
}
declare const electron: any;
declare const app: any, BrowserWindow: any;
declare let win: any;
declare module "renderer" { }
declare module "test2-win32-x64/resources/app/NetworkMessages/Message_Base" {
    export enum MessageType {
        LOGIN = "login",
        RTC_OFFER = "offer",
        RTC_ANSWER = "answer",
        RTC_CANDIDATE = "candidate"
    }
    export interface IMessage_Base {
        messageType: MessageType;
    }
}
declare module "test2-win32-x64/resources/app/NetworkMessages/MessageLoginRequest" {
    import { IMessage_Base } from "test2-win32-x64/resources/app/NetworkMessages/Message_Base";
    export class MessageLoginRequest implements IMessage_Base {
        messageType: import("test2-win32-x64/resources/app/NetworkMessages/Message_Base").MessageType;
        loginUserName: string;
        constructor(loginUserName: any);
    }
}
declare module "Server/ServerMain" { }
declare module "test2-win32-x64/resources/app/UiElementHandler" {
    export abstract class UiElementHandler {
        static signaling_submit: HTMLElement;
        static signaling_url: HTMLInputElement;
        static login_nameInput: HTMLElement;
        static login_button: HTMLElement;
        static msgInput: HTMLInputElement;
        static chatbox: HTMLInputElement;
        static sendMsgButton: HTMLElement;
        static connectToUserButton: HTMLElement;
        static usernameToConnectTo: HTMLInputElement;
        static disconnectButton: HTMLElement;
        static getAllUiElements(): void;
    }
}
declare module "test2-win32-x64/resources/app/NetworkMessages/MessageOffer" {
    import { IMessage_Base } from "test2-win32-x64/resources/app/NetworkMessages/Message_Base";
    export class MessageOffer implements IMessage_Base {
        messageType: import("test2-win32-x64/resources/app/NetworkMessages/Message_Base").MessageType;
        userNameToConnectTo: string;
        offer: string;
        constructor(userNameToConnectTo: string, offer: string);
    }
}
declare module "test2-win32-x64/resources/app/NetworkMessages/MessageAnswer" {
    import { IMessage_Base } from "test2-win32-x64/resources/app/NetworkMessages/Message_Base";
    export class MessageAnswer implements IMessage_Base {
        messageType: import("test2-win32-x64/resources/app/NetworkMessages/Message_Base").MessageType;
        userNameToConnectTo: string;
        answer: string;
        constructor(userNameToConnectTo: string, answer: string);
    }
}
declare module "test2-win32-x64/resources/app/NetworkMessages/MessageCandidate" {
    import { IMessage_Base } from "test2-win32-x64/resources/app/NetworkMessages/Message_Base";
    export class MessageCandidate implements IMessage_Base {
        messageType: import("test2-win32-x64/resources/app/NetworkMessages/Message_Base").MessageType;
        userNameToConnectTo: string;
        candidate: string;
        constructor(userNameToConnectTo: string, candidate: string);
    }
}
declare module "test2-win32-x64/resources/app/NetworkConnectionManager" {
    export class NetworkConnectionManager {
        ws: any;
        username: any;
        usernameField: any;
        connection: any;
        otherUsername: any;
        peerConnection: any;
        configuration: {
            iceServers: {
                url: string;
            }[];
        };
        constructor();
        addUiListeners: () => void;
        addWsEventListeners: () => void;
        handleCandidate: (candidate: any) => void;
        handleAnswer: (answer: any) => void;
        handleOffer: (offer: any, username: any) => void;
        handleLogin: (loginSuccess: any) => void;
        loginLogic: (event: any) => void;
        createRTCConnection: () => void;
        connectToUser: () => void;
        createRtcOffer: (userNameForOffer: any) => void;
        sendMessage: (message: any) => void;
        sendMessageToUser: () => void;
    }
}
declare const electron: any;
declare const app: any, BrowserWindow: any;
declare let win: any;
declare module "test2-win32-x64/resources/app/renderer" { }
declare module "test2-win32-x64/resources/app/js/server/server_main" { }
