import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class BecomeServerRequest implements MessageBase {

    public originatorId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;
    // public messageType: NETWORKENUMS.MESSAGE_TYPE = NETWORKENUMS.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;
    constructor(_originatorId: string) {
        this.originatorId = _originatorId;
    }

}
