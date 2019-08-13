"use strict";
var TESTONE;
(function (TESTONE) {
    function testlog() {
        console.log("What");
    }
    TESTONE.testlog = testlog;
    let TEST_ENUM;
    (function (TEST_ENUM) {
        TEST_ENUM["SERIOUSLY"] = "wtf";
    })(TEST_ENUM = TESTONE.TEST_ENUM || (TESTONE.TEST_ENUM = {}));
})(TESTONE || (TESTONE = {}));
