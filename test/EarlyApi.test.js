/**
 * Test Early API
 */

const assert = require('assert');
const EarlyApi = require('../lib/EarlyApi');
const config = require('../config');

const Early = new EarlyApi();

describe('Connect to Developer API', () => {
    it('Should retrieve an API token', () => {
        Early.connect(config.earlyKey, config.earlySecret).then(token => {
            assert(Early.#apiToken.length > 0, "Token length is 0.");
        });
    });

    it('Should return Early activities', () => {
        Early.connect(config.earlyKey, config.earlySecret).then(token => {
            Early.getActivities().then(activities => {
                assert(typeof activities?.activities === 'array', "Invalid data structure returned.");
            });
        });
    });
});
