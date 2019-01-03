
const Transport = require('./Transport');

/**
 * Transport class using HTTP stream
 */
class HttpStreamTransport extends Transport {

    /**
     * Constructor
     * @param {ServerResponse} res - the HTTP response object
     */
    constructor(res) {
        super();

        this.res = res;
        this.res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        this.res.write('00'.repeat(10));

        this.res.on('close', this.onResClose.bind(this));
        this.on(Transport.SEND, this.onSend.bind(this));
        this.on(Transport.CLOSE, this.onClose.bind(this));
    }

    /**
     * Sends the message through the underlying HTTP stream
     * @private
     * @param {Object} message - the message to be sent
     * @returns {void}
     */
    onSend(message) {
        this.res.write(JSON.stringify(message.toObject()));
    }

    /**
     * Closes the underlying HTTP stream
     * @private
     * @returns {void}
     */
    onClose() {
        this.res.end();
    }

    /**
     * Handler for closing HTTP stream
     * @private
     * @returns {void}
     */
    onResClose() {
        this.close();
    }

}

module.exports = HttpStreamTransport;
