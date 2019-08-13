"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var FudgeNetwork;
(function (FudgeNetwork) {
    class IdAssigned {
        constructor(_assignedId) {
            this.originatorId = "Server";
            this.messageType = NetworkTypes.MESSAGE_TYPE.ID_ASSIGNED;
            this.assignedId = _assignedId;
        }
    }
    FudgeNetwork.IdAssigned = IdAssigned;
})(FudgeNetwork || (FudgeNetwork = {}));
