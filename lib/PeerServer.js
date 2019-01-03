
const WebSocketServer = require('ws').Server;
const url = require('url');
const { EventEmitter } = require('events');
const uuid = require('uuid/v4');
const MapCounter = require('./MapCounter');
const { WebSocketTransport, HttpStreamTransport, Transport } = require('./transport');
const PeerMessage = require('./PeerMessage');
const Timer = require('./Timer');

/**
 * Peer Server class
 */
class PeerServer extends EventEmitter {

    /**
     * Constructor
     * @param {Object} options - the options
     */
    constructor(options = { }) {
        super();

        this.options = {
            debug: false,
            timeout: 500,
            key: 'peerjs',
            ipLimit: options.ip_limit || 5000,
            concurrentLimit: options.concurrent_limit || 5000,
            allowDiscovery: options.allow_discovery || false,
            proxied: false,

            ...options,
        };

        this.webSocketServer = new WebSocketServer({ noServer: true });

        this.webSocketServer.on('connection', this.onWebSocketConnection.bind(this));
        this.webSocketServer.on('error', this.onWebSocketError.bind(this));

        this.remoteAddressCounter = new MapCounter();
        this.clients = new Map();
        this.outstanding = new Map();

        this.pruneOutstandingTimer = new Timer(5000);
        this.pruneOutstandingTimer.on(Timer.TICK, this.onPruneOutstanding.bind(this));
        this.pruneOutstandingTimer.start();
    }

    /**
     * Handler for websocket errors
     * @param {Error} error - the error
     * @returns {void}
     */
    onWebSocketError(error) {
        console.error('WebSocketServer error:', error);
    }

    /**
     * Handler for websocket connection
     * @param {WebSocket} wsClient - the websocket client
     * @param {IncomingMessage} req - the http request
     * @returns {void}
     */
    async onWebSocketConnection(wsClient, req) {
        const { query } = url.parse(req.url, true);
        const { id, token, key } = query;
        const { remoteAddress } = req.socket;
        const transport = new WebSocketTransport(wsClient);

        if (!id || !token || !key) {
            transport.sendError('No id, token, or key supplied to websocket server');
            transport.close();

            return;
        }

        if (!this.clients.has(id)) {
            try { await this.checkKey(key, remoteAddress); }
            catch (error) {
                transport.sendError(error);

                return;
            }

            this.clients.set(id, { token, remoteAddress, transport });
            this.remoteAddressCounter.increment(remoteAddress);
            transport.send(new PeerMessage(PeerMessage.OPEN));
        }

        const client = this.clients.get(id);
        if (token !== client.token) {
            transport.sendMessage(PeerMessage.ID_TAKEN, 'ID is taken');
            transport.close();

            return;
        }

        if (client.transport instanceof HttpStreamTransport) {
            client.transport.close();
            client.transport = transport;
        }

        this.processOutstanding(id);

        client.transport.on(Transport.MESSAGE, this.onPeerMessage.bind(this, client));
    }

    /**
     * Handler for receiving peer messages
     * @param {Object} sender - the sender client object
     * @param {PeerMessage} peerMessage - the peer message
     * @returns {void}
     */
    onPeerMessage(sender, peerMessage) {
        if (peerMessage.type === PeerMessage.PING) { return; }

        if (![PeerMessage.LEAVE, PeerMessage.CANDIDATE, PeerMessage.OFFER, PeerMessage.ANSWER].includes(peerMessage.type)) {
            console.warn(`Message unrecognized: ${peerMessage.type}`);
        }

        this.handleTransmission(peerMessage.setSource(sender.id));
    }

    /**
     * Handler for pruning outstanding messages
     * @returns {void}
     */
    onPruneOutstanding() {
        this.outstanding.forEach(peerMessages => {
            const seen = { };

            peerMessages.forEach(peerMessage => {
                if (seen[peerMessage.source]) { return; }

                seen[peerMessage.source] = true;
                this.handleTransmission(peerMessage.swapRecipients().removePayload().changeType(PeerMessage.EXPIRE));
            });
        });

        this.outstanding.clear();
    }

    /**
     * Checks the key and remote address against some validations
     * @param {String} key - the key
     * @param {String} remoteAddress - the remote address
     * @throws {Error}
     * @returns {void}
     */
    async checkKey(key, remoteAddress) {
        if (key !== this.options.key) {
            throw new Error('Invalid key provided');
        }

        // check concurrent limit
        if (this.clients.size >= this.options.concurrentLimit) {
            throw new Error('Server has reached its concurrent user limit');
        }

        if (this.remoteAddressCounter.count(remoteAddress) >= this.options.ipLimit) {
            throw new Error(`${remoteAddress} has reached its concurrent user limit`);
        }
    }

    /**
     * Removes a peer client
     * @param {String} id - the client id
     * @returns {void}
     */
    removeClient(id) {
        if (this.clients.has(id)) {
            const client = this.clients.get(id);
            this.remoteAddressCounter.decrement(client.remoteAddress);
            this.clients.delete(id);
            this.emit(PeerServer.DISCONNECT, id);
        }
    }

    /**
     * Original _handleTransmission method
     * @param {PeerMessage} peerMessage - the message
     * @returns {void}
     */
    handleTransmission(peerMessage) {
        if (this.clients.has(peerMessage.destination)) {
            const destination = this.clients.get(peerMessage.destination);
            
            try {    
                if (!destination.transport) { throw new Error('Peer dead'); }

                destination.transport.send(peerMessage);
            } catch (error) {
                this.removeClient(peerMessage.destination);
                this.handleTransmission(peerMessage.swapRecipients().removePayload().changeType(PeerMessage.LEAVE).toObject());
            }
        } else if (peerMessage.type !== PeerMessage.LEAVE && peerMessage.type !== PeerMessage.EXPIRE && peerMessage.destination) {
            if (!this.outstanding.has(peerMessage.destination)) {
                this.outstanding.set(peerMessage.destination, []);
            }

            this.outstanding.get(peerMessage.destination).push(peerMessage);
        } else if (peerMessage.type === PeerMessage.LEAVE && !peerMessage.destination) {
            this.removeClient(peerMessage.source);
        }
    }

    /**
     * Original _generateClientId method
     * @returns {String} - the generated client id
     */
    generateClientId() {
        return uuid();
    }

    /**
     * Processes the outstanding messages
     * @param {String} id - the client id
     * @returns {void}
     */
    processOutstanding(id) {
        if (!this.outstanding.has(id)) { return; }

        this.outstanding.get(id).forEach(this.handleTransmission.bind(this));
        this.outstanding.delete(id);
    }

}

PeerServer.DISCONNECT = 'disconnect';

module.exports = PeerServer;
