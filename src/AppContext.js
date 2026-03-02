/**
 * AppContext
 *
 * Singleton module that initializes and exposes the Timeular2Noko instance.
 * Import getT2N() in task files to access the initialized API connections.
 */

import config from '../config.js';
import Timeular2Noko from './Timeular2Noko.js';

let _T2N = null;

/**
 * Initialize the Timeular2Noko instance and authenticate with the Timeular API.
 *
 * @param {object} options - CLI options (debug, roundUp, etc.)
 * @returns {Promise<void>}
 */
export async function initApp(options = {}) {
    config.roundEntry = options.roundUp || 5;
    _T2N = new Timeular2Noko(config);
    await _T2N.init(options);
}

/**
 * Get the initialized Timeular2Noko instance.
 *
 * @returns {Timeular2Noko}
 */
export function getT2N() {
    return _T2N;
}
