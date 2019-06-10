export abstract class UiElementHandler {
    public static signaling_submit: HTMLElement;
    public static signaling_url: HTMLInputElement;
    public static login_nameInput : HTMLElement;
    public static login_button : HTMLElement;
    public static msgInput: HTMLInputElement;
    public static chatbox: HTMLInputElement;
    public static sendMsgButton : HTMLElement;
    public static connectToUserButton : HTMLElement;
    public static usernameToConnectTo: HTMLInputElement;
    public static disconnectButton : HTMLElement;

    public static getAllUiElements() {
            UiElementHandler.signaling_url = document.getElementById("signaling_uri") as HTMLInputElement;
            UiElementHandler.signaling_submit = document.getElementById("submit_button") as HTMLElement;
            UiElementHandler.login_nameInput = document.getElementById("login_name") as HTMLElement;
            UiElementHandler.login_button = document.getElementById("login_button") as HTMLElement;
            UiElementHandler.msgInput = document.getElementById("msgInput") as HTMLInputElement;
            UiElementHandler.chatbox = document.getElementById("chatbox") as HTMLInputElement;
            UiElementHandler.sendMsgButton = document.getElementById("sendMessage") as HTMLElement;
            UiElementHandler.connectToUserButton = document.getElementById("userConnect") as HTMLElement;
            UiElementHandler.usernameToConnectTo = document.getElementById("connectToUsername") as HTMLInputElement;
            UiElementHandler.disconnectButton = document.getElementById("disconnectBtn") as HTMLElement;
    }

}
