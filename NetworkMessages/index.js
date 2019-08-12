System.register(["./LoginRequest", "./IceCandidate", "./RtcAnswer", "./RtcOffer", "./LoginResponse", "./IdAssigned"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (LoginRequest_1_1) {
                exportStar_1(LoginRequest_1_1);
            },
            function (IceCandidate_1_1) {
                exportStar_1(IceCandidate_1_1);
            },
            function (RtcAnswer_1_1) {
                exportStar_1(RtcAnswer_1_1);
            },
            function (RtcOffer_1_1) {
                exportStar_1(RtcOffer_1_1);
            },
            function (LoginResponse_1_1) {
                exportStar_1(LoginResponse_1_1);
            },
            function (IdAssigned_1_1) {
                exportStar_1(IdAssigned_1_1);
            }
        ],
        execute: function () {
        }
    };
});
