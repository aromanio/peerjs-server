
/**
 * Simple counter over a hash map
 */
class MapCounter {

    /**
     * Constructor
     */
    constructor() {
        this.map = { };
    }

    /**
     * Increments the count of key
     * @param {String} key - the key to be incremented
     * @returns {void}
     */
    increment(key) {
        this.map[key] = (this.map[key] || 0) + 1;
    }

    /**
     * Decrements the count of key to a minimum of zero
     * @param {String} key - the key to be decremented
     * @returns {void}
     */
    decrement(key) {
        this.map[key] = (this.map[key] || 1) - 1;

        if (this.map[key] === 0) {
            delete this.map[key];
        }
    }

    /**
     * Gets the count of key
     * @param {String} key - the key to get count from
     * @returns {Number} - the count of key
     */
    count(key) {
        return this.map[key] || 0;
    }
}

module.exports = MapCounter;
