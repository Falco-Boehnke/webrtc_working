import * as WebSocket from "ws";
import * as NetworkMessages from "./../NetworkMessages";
import * as TYPES from "./../DataCollectors/Enumerators/EnumeratorCollection";

import { Client } from "./../DataCollectors/Client";
export class AuthoritativeServer {


    private peerConnectedClientCollection: Client[] = new Array();
    
    constructor(){
        console.log("AuthoritativeServerStartet");
    }

   


    public static createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }
    //#endregion


    public static parseMessageToJson(_messageToParse: string): NetworkMessages.MessageBase {
        let parsedMessage: NetworkMessages.MessageBase = { originatorId: " ", messageType: TYPES.MESSAGE_TYPE.UNDEFINED };

        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    // TODO Type Websocket not assignable to type WebSocket ?!
    public static sendTo = (_connection: any, _message: Object) => {
        _connection.send(JSON.stringify(_message));
    }

    // private initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer: string): void => {
    //     console.log("Creating Datachannel for connection and then creating offer");
    //     this.localDataChannel = this.connection.createDataChannel("localDataChannel");
    //     this.localDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
    //     this.localDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
    //     this.localDataChannel.addEventListener("message", this.dataChannelMessageHandler);
    //     this.connection.createOffer()
    //         .then(async (offer) => {
    //             console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.connection.signalingState);
    //             return offer;
    //         })
    //         .then(async (offer) => {
    //             await this.connection.setLocalDescription(offer);
    //             console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.connection.signalingState);
    //         })
    //         .then(() => {
    //             this.createOfferMessageAndSendToRemote(_userNameForOffer);
    //         })
    //         .catch(() => {
    //             console.error("Offer creation error");
    //         });
    // }

    // private createOfferMessageAndSendToRemote = (_userNameForOffer: string) => {
    //     const offerMessage: NetworkMessages.RtcOffer = new NetworkMessages.RtcOffer(this.localId, _userNameForOffer, this.connection.localDescription);
    //     this.sendMessage(offerMessage);
    //     console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.connection.signalingState);
    // }





    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    private static searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            if (collectionToSearch.hasOwnProperty(propertyObject)) {
                // tslint:disable-next-line: typedef
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }

    private static searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: Client[]): Client => {
        return AuthoritativeServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private static searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: Client[]): Client => {
        return AuthoritativeServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private static searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: Client[]) => {
        return AuthoritativeServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }

    // public static searchForClientWithId(_idToFind: string): Client {
    //     return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    // }
}
