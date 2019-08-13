// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
namespace NetworkMessages {
    export class BecomeServerRequest implements NetworkMessages.MessageBase {

        public originatorId: string;
        public messageType: NetworkTypes.MESSAGE_TYPE = NetworkTypes.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;

        constructor(_originatorId: string) {
            this.originatorId = _originatorId;
        }

    }
}
