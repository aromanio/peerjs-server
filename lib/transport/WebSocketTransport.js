
const Transport = require('./Transport');
const PeerMessage = require('../PeerMessage');

/**
 * Transport class using websocket
 */
class WebSocketTransport extends Transport {
    
    /**
     * Constructor
     * @param {WebSocket} wsClient - the websocket client
     */
    constructor(wsClient) {
        super();

        this.wsClient = wsClient;

        this.wsClient.on('close', this.onWsClose.bind(this));
        this.wsClient.on('message', this.onWsMessage.bind(this));
        this.on(Transport.SEND, this.onSend.bind(this));
        this.on(Transport.CLOSE, this.onClose.bind(this));
    }

    /**
     * Sends the message through the underlying websocket connection
     * @param {Object} message - the message to be sent
     * @returns {void}
     */
    onSend(message) {
        this.wsClient.send(JSON.stringify(message.toObject()));
    }

    /**
     * Closes the underlying websocket connection
     * @returns {void}
     */
    onClose() {
        this.wsClient.close();
    }

    /**
     * Handler for closing websocket connection
     * @returns {void}
     */
    onWsClose() {
        this.close();
    }

    /**
     * Handler for receiving peer messages
     * @param {Object} data - the data received through websocket
     * @returns {void}
     */
    onWsMessage(data) {
        try {
            const messageObject = JSON.parse(data);
            const peerMessage = PeerMessage.fromObject(messageObject);

            this.emit(Transport.MESSAGE, peerMessage);
        } catch (error) {
            console.warn(`Invalid message: ${data}`);
        }
    }

}

module.exports = WebSocketTransport;
