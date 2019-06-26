import {MESSAGE_TYPE} from "./../DataCollectors/Enumerators/EnumeratorCollection";
export interface MessageBase {

    // TODO add field for uniqueUserID, making it easier to identify clients without using websockets
        readonly messageType: MESSAGE_TYPE;
        
    }

