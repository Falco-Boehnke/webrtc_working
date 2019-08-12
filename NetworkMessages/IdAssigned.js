System.register(["./../DataCollectors/Enumerators/EnumeratorCollection"], function (exports_1, context_1) {
    "use strict";
    var TYPES, IdAssigned;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TYPES_1) {
                TYPES = TYPES_1;
            }
        ],
        execute: function () {
            IdAssigned = class IdAssigned {
                constructor(_assignedId) {
                    this.originatorId = "Server";
                    this.messageType = TYPES.MESSAGE_TYPE.ID_ASSIGNED;
                    this.assignedId = _assignedId;
                }
            };
            exports_1("IdAssigned", IdAssigned);
        }
    };
});
