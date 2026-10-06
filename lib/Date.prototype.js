/**
 * Date object extensions.
 */

/**
 * Format a time string to match Early's specs.
 *
 * @returns {string}
 */
Date.prototype.getEarlyTime = function() {
    // Adjust timezone offset for GMT.
    this.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return this.toISOString().slice(0, -1);
}

Array.prototype.earlyEntryTimeSort = function() {
    this.sort((a, b) => a.getDate().getTime() - b.getDate().getTime());
}