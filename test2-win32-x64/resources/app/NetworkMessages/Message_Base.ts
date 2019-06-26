export enum MessageType {
    LOGIN = "login",
    RTC_OFFER = "offer",
    RTC_ANSWER = "answer",
    RTC_CANDIDATE = "candidate",
}

export interface IMessage_Base {

messageType: MessageType;

}
