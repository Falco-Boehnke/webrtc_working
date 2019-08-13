"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var NetworkMessages;
(function (NetworkMessages) {
    class IdAssigned {
        constructor(_assignedId) {
            this.originatorId = "Server";
            this.messageType = NetworkTypes.MESSAGE_TYPE.ID_ASSIGNED;
            this.assignedId = _assignedId;
        }
    }
    NetworkMessages.IdAssigned = IdAssigned;
})(NetworkMessages || (NetworkMessages = {}));
