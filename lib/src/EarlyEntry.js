/**
 * Class to manage Early time entry objects.
 */
class EarlyEntry {
    /**
     * The Early time entry object from the API.
     */
    earlyObject = {};

    /**
     * The activity the entry was logged to.
     */
    activity = {};

    /**
     * Constructor.
     * @param entry
     */
    constructor(entry) {
        this.earlyObject = entry;
        this.activity = null;
    }

    getDuration() {
        let timeStart = new Date(this.earlyObject.duration.startedAt + 'z');
        let timeEnd = new Date(this.earlyObject.duration.stoppedAt + 'z');
        return parseInt((timeEnd.valueOf() - timeStart.valueOf()) / (60 * 1000));
    }

    getDate() {
        return new Date(this.earlyObject.duration.stoppedAt + 'z');
    }

    getDay() {
        const date = this.getDate();
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }

    getNotes() {
        let notes = [];

        // Get tags.
        this.earlyObject.note.tags.forEach(value => {
            notes.push("#" + value.label);
        });

        // Get text.
        const text = this.earlyObject.note.text || "";
        const tagPattern = /(<{{\|t\|\d{0,}\|}}>)*/gi;
        let tagless = text.replace(tagPattern, "");
        if (tagless.length > 0) {
            notes.push(tagless);
        }

        // Get mentions.
        // @todo: Does this have any benefit outside of Early?  If not, ignore it.

        return notes;
    };

    /**
     * Get the activity associated with this entry.
     * @returns {EarlyActivity}
     */
    getActivity() {
        return this.activity;
    }
}

export default EarlyEntry;
