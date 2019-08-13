"use strict";
// import { MessageBase } from ".";
// import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";
var NetworkMessages;
(function (NetworkMessages) {
    class BecomeServerRequest {
        constructor(_originatorId) {
            this.messageType = NetworkTypes.MESSAGE_TYPE.SERVER_ASSIGNMENT_REQUEST;
            this.originatorId = _originatorId;
        }
    }
    NetworkMessages.BecomeServerRequest = BecomeServerRequest;
})(NetworkMessages || (NetworkMessages = {}));
