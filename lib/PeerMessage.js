
/**
 * Class representation of a message
 */
class PeerMessage {

    /**
     * Constructor
     * @param {String} type - the type of message
     */
    constructor(type) {
        this.type = type;
    }

    /**
     * Changes the type of the message
     * @param {String} type - the new type of message
     * @returns {PeerMessage} - a cloned and updated message
     */
    changeType(type) {
        const clone = this.clone();
        clone.type = type;

        return clone;
    }

    /**
     * Sets the source
     * @param {String} source - the new source
     * @returns {PeerMessage} - a cloned and updated message
     */
    setSource(source) {
        const clone = this.clone();
        clone.source = source;

        return clone;
    }

    /**
     * Removes the source
     * @returns {PeerMessage} - a cloned and updated message
     */
    removeSource() {
        const clone = this.clone();
        delete clone.source;

        return clone;
    }

    /**
     * Sets the destination
     * @param {String} destination - the new destination
     * @returns {PeerMessage} - a cloned and updated message
     */
    setDestination(destination) {
        const clone = this.clone();
        clone.destination = destination;

        return clone;
    }

    /**
     * Removes the destination
     * @returns {PeerMessage} - a cloned and updated message
     */
    removeDestination() {
        const clone = this.clone();
        delete clone.destination;

        return clone;
    }
    
    /**
     * Sets the payload
     * @param {*} payload - the new payload
     * @returns {PeerMessage} - a cloned and updated message
     */
    setPayload(payload) {
        const clone = this.clone();
        clone.payload = payload;

        return clone;
    }

    /**
     * Removes the payload
     * @returns {PeerMessage} - a cloned and updated message
     */
    removePayload() {
        const clone = this.clone();
        delete clone.payload;

        return clone;
    }

    /**
     * Swaps the recipients
     * @returns {PeerMessage} - a cloned and updated message
     */
    swapRecipients() {
        const clone = this.clone();
        const { source, destination } = clone;
        clone.source = destination;
        clone.destination = source;

        return clone;
    }

    /**
     * Removes the recipients
     * @returns {PeerMessage} - a cloned and updated message
     */
    removeRecipients() {
        const clone = this.clone();
        delete clone.source;
        delete clone.destination;

        return clone;
    }

    /**
     * Clones the message
     * @returns {PeerMessage} - a cloned message
     */
    clone() {
        const clone = new PeerMessage(this.type);
        clone.source = this.source;
        clone.destination = this.destination;
        clone.payload = this.payload;

        return clone;
    }

    /**
     * Transforms the message in an object ready to be transmitted
     * @returns {Object} - the transmission object
     */
    toObject() {
        const message = { type: this.type };

        if (this.source) {
            message.src = this.source;
        }

        if (this.destination) {
            message.dst = this.destination;
        }

        if (this.payload) {
            message.payload = this.payload;
        }

        return message;
    }

}

/**
 * Converts an transmission object to a peer message
 * @param {Object} object - the transission object
 * @returns {PeerMessage} - the peer message
 */
PeerMessage.fromObject = (object) => {
    let message = new PeerMessage(object.type);

    if (object.payload) {
        message = message.setPayload(object.payload);
    }

    if (object.src) {
        message = message.setSource(object.src);
    }

    if (object.dst) {
        message = message.setDestination(object.dst);
    }

    return message;
};

PeerMessage.ERROR = 'ERROR';
PeerMessage.OPEN = 'OPEN';
PeerMessage.ID_TAKEN = 'ID-TAKEN';
PeerMessage.LEAVE = 'LEAVE';
PeerMessage.CANDIDATE = 'CANDIDATE';
PeerMessage.OFFER = 'OFFER';
PeerMessage.ANSWER = 'ANSWER';
PeerMessage.HEARTBEAT = 'HEARTBEAT';
PeerMessage.HTTP_ERROR = 'HTTP-ERROR';
PeerMessage.EXPIRE = 'EXPIRE';
PeerMessage.PING = 'PING';

module.exports = PeerMessage;
