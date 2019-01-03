
const { EventEmitter } = require('events');

/**
 * Timeout utility class
 */
class Timer extends EventEmitter {

    /**
     * Constructor
     * @param {Number} delay - delay in milliseconds between ticks
     */
    constructor(delay) {
        super();

        this.delay = delay;
    }

    /**
     * Starts the timeout watcher
     * @returns {void}
     */
    start() {
        this.interval = setInterval(this.emit.bind(this, Timer.TICK), this.delay);
    }

    /**
     * Clears the timeout watcher
     * @returns {void}
     */
    stop() {
        clearInterval(this.interval);
    }

}

Timer.TICK = 'tick';

module.exports = Timer;
