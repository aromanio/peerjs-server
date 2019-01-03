const { EventEmitter } = require('events');
const Timer = require('./Timer');
const { Transport } = require('./transport');
const PeerMessage = require('./PeerMessage');

/**
 * Peer Client class
 */
class PeerClient extends EventEmitter {

    /**
     * Constructor
     * @param {String} id - the client id
     * @param {ClientsList} clients - the clients list
     * @param {Number} timeout - the timeout to disconnect
     */
    constructor(id, clients, timeout = 5000) {
        super();

        this.id = id;

        /**
         * @type {ClientsList}
         */
        this.clients = clients;

        this.timeoutTimer = new Timer(timeout);
        this.timeoutTimer.on(Timer.TICK, this.onTimeout.bind(this));
        this.timeoutTimer.start();

        /**
         * @type {PeerMessage[]}
         */
        this.queue = [];
        
        /**
         * @type {Transport}
         */
        this.transport = null;

        this.onTransportClose = this.onTransportClose.bind(this);
    }

    /**
     * Sets the client token
     * @param {String} token - the client token
     * @returns {void}
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Handler for disconnect timeout
     * @returns {void}
     */
    onTimeout() {
        this.timeoutTimer.stop();
        this.emit(PeerClient.DISCONNECT);

        this.queue.forEach(message => {
            const client = this.clients.get(message.source);
            client.send(message.changeType(PeerMessage.EXPIRE).swapRecipients().removePayload(), false);
        });
    }

    /**
     * Sets the transport for this client
     * @param {Transport} transport - the transport
     * @returns {void}
     */
    setTransport(transport) {
        this.timeout.stop();

        if (this.transport) {
            this.transport.off(Transport.CLOSE, this.onTransportClose);
        }

        this.transport = transport;
        this.transport.on(Transport.CLOSE, this.onTransportClose);

        this.queue.forEach(message => this.transport.send(message));
        this.queue = [];
    }

    /**
     * Handler for closing the transport
     * @returns {void}
     */
    onTransportClose() {
        this.timeout.start();
        this.transport = null;
    }

    /**
     * Sends a message string through the transport
     * @param {String} type - the message type
     * @param {String} msg - the message string
     * @returns {void}
     */
    sendMessage(type, msg) {
        const message = new PeerMessage(type).setPayload({ msg });
        this.send(message);
    }

    /**
     * Sends an error message through the transport
     * @param {Error|String} error - the error object
     * @returns {void}
     */
    sendError(error) {
        const message = new PeerMessage(PeerMessage.ERROR).setPayload({ msg: error.message || error });
        this.send(message);
    }

    /**
     * Sends a message to client
     * @param {PeerMessage} message - the message to be sent
     * @param {Boolean?} queueIfNotConnected - wether to queue the message if the client is not connected yet
     * @returns {void}
     */
    send(message) {
        if (!this.transport) {
            if (message.type !== PeerMessage.LEAVE && message.type !== PeerMessage.EXPIRE) {
                this.queue.push(message);
            }

            return;
        }

        this.transport.send(message);
    }

}

PeerClient.DISCONNECT = 'disconnect';

module.exports = PeerClient;
