import { MessageBase } from ".";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
export class IdAssigned implements MessageBase {

    public originatorId: string = "Server";
    public assignedId: string;
    public messageType: TYPES.MESSAGE_TYPE = TYPES.MESSAGE_TYPE.ID_ASSIGNED;

    constructor(_assignedId: string) {
        this.assignedId = _assignedId;
    }

}
