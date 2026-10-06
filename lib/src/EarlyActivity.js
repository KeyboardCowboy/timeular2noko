/**
 * Class to manage Early activity objects.
 */
class EarlyActivity {
    /**
     * The object returned from Early.
     * @type {{}}
     */
    earlyObject = {};

    /**
     * Class to manage Early Activities.
     */
    constructor(activity) {
        /**
         * The activity object returned from the API.
         */
        this.earlyObject = activity;

        /**
         * Get the name of the activity.
         * @returns {string}
         */
        this.getName = () => {
            return this.earlyObject.name;
        }

        /**
         * Get the Activity ID number.
         * @returns {string}
         */
        this.getId = () => {
            return this.earlyObject.id;
        }
    }
}

export default EarlyActivity;
