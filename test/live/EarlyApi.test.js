/**
 * Test Early API
 */

import assert from 'assert';
import EarlyApi from '../../lib/EarlyApi.js';
import config from '../../config.js';

const Early = new EarlyApi();

describe('Connect to Developer API', () => {
    it('Should retrieve an API token', () => {
        Early.connect(config.earlyKey, config.earlySecret).then(token => {
            assert(token.length > 0, "Token length is 0.");
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
