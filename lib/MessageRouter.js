/* eslint-disable */
class MessageRouter {

    constructor() {
        this.recipients = [];
        this.messageQueue = [];
    }

    addRecipient(peerClient) {
        this.recipients.push(peerClient);
    }

}