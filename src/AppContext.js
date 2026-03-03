/**
 * AppContext
 *
 * Singleton module that initializes and exposes the Early2Noko instance.
 * Import getT2N() in task files to access the initialized API connections.
 */

import config from '../config.js';
import Early2Noko from './Early2Noko.js';

let _T2N = null;

/**
 * Initialize the Early2Noko instance and authenticate with the Early API.
 *
 * @param {object} options - CLI options (debug, roundUp, etc.)
 * @returns {Promise<void>}
 */
export async function initApp(options = {}) {
    config.roundEntry = options.roundUp || 5;
    _T2N = new Early2Noko(config);
    await _T2N.init(options);
}

/**
 * Get the initialized Early2Noko instance.
 *
 * @returns {Early2Noko}
 */
export function getT2N() {
    return _T2N;
}
