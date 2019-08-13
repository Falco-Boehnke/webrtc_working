declare namespace FudgeNetwork {
    abstract class UiElementHandler {
        static signalingSubmit: HTMLElement;
        static signalingUrl: HTMLInputElement;
        static loginNameInput: HTMLInputElement | null;
        static loginButton: HTMLElement;
        static msgInput: HTMLInputElement;
        static chatbox: HTMLInputElement;
        static sendMsgButton: HTMLElement;
        static connectToUserButton: HTMLElement;
        static usernameToConnectTo: HTMLInputElement;
        static disconnectButton: HTMLElement;
        static startSignalingButton: HTMLElement;
        static peerToPeerHtmlElements: HTMLElement;
        static authoritativeElements: HTMLElement;
        static switchModeButton: HTMLElement;
        static stopSignalingServer: HTMLElement;
        static broadcastButton: HTMLElement;
        static getAllUiElements(): void;
    }
}
