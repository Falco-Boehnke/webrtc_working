"use strict";
var FudgeNetwork;
(function (FudgeNetwork) {
    let MESSAGE_TYPE;
    (function (MESSAGE_TYPE) {
        MESSAGE_TYPE["UNDEFINED"] = "undefined";
        MESSAGE_TYPE["ID_ASSIGNED"] = "id_assigned";
        MESSAGE_TYPE["LOGIN_REQUEST"] = "login_request";
        MESSAGE_TYPE["LOGIN_RESPONSE"] = "login_response";
        MESSAGE_TYPE["RTC_OFFER"] = "offer";
        MESSAGE_TYPE["RTC_ANSWER"] = "answer";
        MESSAGE_TYPE["ICE_CANDIDATE"] = "candidate";
        MESSAGE_TYPE["SERVER_ASSIGNMENT_REQUEST"] = "server_assignment_request";
        MESSAGE_TYPE["SERVER_COMMAND"] = "server_command";
        MESSAGE_TYPE["PEER_TEXT_MESSAGE"] = "peer_text_message";
        MESSAGE_TYPE["SERVER_TO_PEER_MESSAGE"] = "server_to_peer_message";
    })(MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE || (FudgeNetwork.MESSAGE_TYPE = {}));
    let SERVER_COMMAND_TYPE;
    (function (SERVER_COMMAND_TYPE) {
        SERVER_COMMAND_TYPE["UNDEFINED"] = "undefined";
        SERVER_COMMAND_TYPE["DISCONNECT_CLIENT"] = "disconnect_client";
        SERVER_COMMAND_TYPE["SPAWN_OBJECT"] = "spawn_object";
        SERVER_COMMAND_TYPE["ASSIGN_OBJECT_TO_CLIENT"] = "assign_object_to_client";
        SERVER_COMMAND_TYPE["DESTROY_OBJECT"] = "destroy_object";
        SERVER_COMMAND_TYPE["KEYS_INPUT"] = "keys_input";
        SERVER_COMMAND_TYPE["MOVEMENT_VALUE"] = "movement_value";
    })(SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE || (FudgeNetwork.SERVER_COMMAND_TYPE = {}));
})(FudgeNetwork || (FudgeNetwork = {}));
