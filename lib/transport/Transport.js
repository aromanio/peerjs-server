
const { EventEmitter } = require('events');

/**
 * Transport abstraction class
 */
class Transport extends EventEmitter {
    
    /**
     * Constructor
     */
    constructor() {
        super();

        this.closed = false;
    }

    /**
     * Sends the message to the transport recipient
     * @param {PeerMessage} message - the message to be transmitted
     * @returns {void}
     */
    send(message) {
        if (this.closed) {
            throw new Error('Cannot send message through a closed transport');
        }

        this.emit(Transport.SEND, message);
    }

    /**
     * Closes the transport
     * @returns {void}
     */
    close() {
        if (this.closed) {
            throw new Error('Cannot close an already closed transport');
        }

        this.closed = true;
        this.emit(Transport.CLOSE);
    }

}

Transport.SEND = 'send';
Transport.CLOSE = 'close';
Transport.MESSAGE = 'message';

module.exports = Transport;
