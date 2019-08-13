// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
namespace NetworkMessages {
    export class IdAssigned implements NetworkMessages.MessageBase {

        public originatorId: string = "Server";
        public assignedId: string;
        public messageType: NetworkTypes.MESSAGE_TYPE = NetworkTypes.MESSAGE_TYPE.ID_ASSIGNED;

        constructor(_assignedId: string) {
            this.assignedId = _assignedId;
        }

    }
}