
export abstract class UiElementHandler {
    public static signalingSubmit: HTMLElement;
    public static signalingUrl: HTMLInputElement;
    public static loginNameInput: HTMLInputElement | null;
    public static loginButton: HTMLElement;
    public static msgInput: HTMLInputElement;
    public static chatbox: HTMLInputElement;
    public static sendMsgButton: HTMLElement;
    public static connectToUserButton: HTMLElement;
    public static usernameToConnectTo: HTMLInputElement;
    public static disconnectButton: HTMLElement;

    public static getAllUiElements() {
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri") as HTMLInputElement;
        UiElementHandler.signalingSubmit = document.getElementById("submit_button") as HTMLElement;
        UiElementHandler.loginNameInput = document.getElementById("login_name") as HTMLInputElement;
        UiElementHandler.loginButton = document.getElementById("login_button") as HTMLElement;
        console.log("UI ELEMENT HANDLER LOGIC: ", UiElementHandler.loginButton);
        UiElementHandler.msgInput = document.getElementById("msgInput") as HTMLInputElement;
        UiElementHandler.chatbox = document.getElementById("chatbox") as HTMLInputElement;
        UiElementHandler.sendMsgButton = document.getElementById("sendMessage") as HTMLElement;
        UiElementHandler.connectToUserButton = document.getElementById("userConnect") as HTMLElement;
        UiElementHandler.usernameToConnectTo = document.getElementById("connectToUsername") as HTMLInputElement;
        UiElementHandler.disconnectButton = document.getElementById("disconnectBtn") as HTMLElement;
    }

}

