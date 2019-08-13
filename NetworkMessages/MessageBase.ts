namespace FudgeNetwork{

export interface MessageBase {

    readonly messageType: NetworkTypes.MESSAGE_TYPE;
    readonly originatorId: string;

}
}
