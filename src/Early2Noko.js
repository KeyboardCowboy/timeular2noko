/**
 * Custom class to report Early time to Noko.
 */

import EarlyApi from '../lib/EarlyApi.js';
import NokoApi from '../lib/NokoApi.js';
import NokoTimeEntry from '../lib/src/NokoTimeEntry.js';
import colors from 'colors';

class Early2Noko {
    /**
     * The application config.
     */
    config = {};

    /**
     * A connection to the Early API for this account.
     * @type {EarlyApi}
     */
    earlyApi = null;

    /**
     * A connection to the Noko API for this account.
     * @type {NokoApi}
     */
    nokoApi = null;

    /**
     * Instantiate a new project instance.
     *
     * @param config
     * @constructor
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Establish API connections.
     *
     * @returns {Promise<void>}
     */
    init(options) {
        // Instantiate a Noko API object.  Does not require a request.
        this.nokoApi = new NokoApi(this.config.nokoToken);
        this.nokoApi.debug(options.debug);

        // Instantiate an Early API object.
        this.earlyApi = new EarlyApi();
        this.earlyApi.debug(options.debug);

        // Establish the Early access token.
        return new Promise((resolve, reject) => {
            this.earlyApi.connect(this.config.earlyKey, this.config.earlySecret).then(response => {
                resolve(response);
            }).catch(err => {
                console.error(err);
            });
        });
    }

    /**
     * Get an array of tags and notes from each entry.
     *
     * @param earlyEntries
     * @returns {*[]}
     */
    getTasksFromEarlyEntries(earlyEntries) {
        let tasks = [];

        // Gather tags and notes from each entry.
        earlyEntries.forEach(entry => {
            let notes = entry.getNotes();

            // If there are no tags or text on the entry, use the Early Activity label.
            if (notes.length === 0) {
                notes.push(entry.activity.getName());
            }
            else if (this.config.prefixNotes) {
                let actName = entry.activity.getName();

                // Prefix non-tag notes with the activity name.
                notes = notes.map(note => {
                    return note.startsWith('#') ? note : `${actName}: ${note}`;
                })
            }

            tasks = tasks.concat(notes);
        });

        // Clean up the notes from the entries.
        return this.filterNotes(tasks);
    }

    /**
     * Given an array of notes from Early entries, filter out bad entries and duplicates.
     * @param {array} notes
     * @returns {array}
     */
    filterNotes(notes) {
        notes = notes.map((val, index) => {
            // Trim any white space and commas from either end of the string.
            val = val.replace(/^[\s,]+|[\s,]+$/gm, '');

            // Replaces spaces with a hyphen in tags.
            if (val.indexOf('#') === 0) {
                val = val.replace(/ +/g, '-');
            }

            return val;
        });

        // Remove empty and duplicate values.
        return notes.filter((val, index) => {
            return (val.length > 0 && notes.indexOf(val) === index);
        });
    }

    /**
     * Given an array of Early entries, group them by the day they were recorded.
     * @param earlyEntries
     * @returns {{}}
     */
    groupEarlyEntriesByDate(earlyEntries) {
        const grouped = {};

        earlyEntries.forEach(entry => {
            grouped[entry.getDay()] = grouped[entry.getDay()] || [];
            grouped[entry.getDay()].push(entry);
        });

        return grouped;
    }

    /**
     * Given an array of Early entries, group them by the Noko project they are associated with.
     * @param earlyEntries
     * @returns {{}}
     */
    async groupEarlyEntriesByProject(earlyEntries) {
        const grouped = {};

        // Group the entries by project Id.
        for (let entry of earlyEntries) {
            let nokoProjectId = this.getRelatedNokoProjectId(entry);
            grouped[nokoProjectId] = grouped[nokoProjectId] || {project: {}, entries: []};
            grouped[nokoProjectId].entries.push(entry);
        }

        // Attach the related project objects to the grouped array.
        const projects = await this.nokoApi.getProjects(Object.keys(grouped));
        for (let project of projects) {
            grouped[project.getId()].project = project;
        }

        return grouped;
    }

    /**
     * Get the Noko Project Id from an Early Entry via its activity.
     * @param entry
     * @returns {number}
     */
    getRelatedNokoProjectId(entry) {
        const activity = entry.getActivity();
        let nokoProjectId = 0;

        if (this.config.activityProjectMap.hasOwnProperty(activity.getId())) {
            nokoProjectId = this.config.activityProjectMap[activity.getId()];
        }
        return nokoProjectId;
    }

    /**
     * Default message if there are no time entries for a given report.
     */
    printEmptyReport() {
        console.log("There are no time entries in this report.".blue);
    }

    /**
     * Print a report of the time entries for the dates selected to the console.
     *
     * @param date
     * @param {} groupedByProject
     */
    async printDaySummary(date, groupedByProject) {
        let deactivatedProjectCount = 0;
        let deactivatedNotice = '';

        // Print the date.
        console.log(`\n${date.getDayFull()}`.bold.red);

        // Run through each project and print summarized data.
        for (let projId in groupedByProject) {
            const group = groupedByProject[projId];

            // Get the Noko project from the Id.
            const project = group.project;

            // Get the total duration of time worked on this project for this day.
            const projHours = this.sumEarlyEntries(group.entries);

            // Get a filtered array of tasks and tags for the entries in this project.
            const projTasks = this.getTasksFromEarlyEntries(group.entries);

            // Mark deactivated Noko projects.
            if (project.isValid() && !project.isActive()) {
                deactivatedProjectCount++;
                deactivatedNotice = ' (inactive)';
            } else {
                deactivatedNotice = '';
            }

            // Print the project summary.
            console.log(`    ${projHours} hours \t ${project.getName().blue}${deactivatedNotice.italic.yellow} | ${projTasks.join(", ")}`);
        }

        // Get the billable summary time.
        console.log(''); // Empty line between project total and summary.
        this.printBillableSummary(this.getBillableSummary(groupedByProject));

        // Add a notice if the report contains deactivated Noko projects.
        if (deactivatedProjectCount > 0) {
            console.log('');
            console.log(`    There are ${deactivatedProjectCount.toString().bold} archived Noko projects mapped to Early activities today.  Time will not be logged to these projects.`.italic.yellow);
        }
    }

    /**
     * Print a multi-day time summary to the console.
     *
     * @param earlyEntries
     * @returns {Promise<void>}
     */
    async printMultiDaySummary(earlyEntries) {
        const dateGroup = this.groupEarlyEntriesByDate(earlyEntries);
        let summaryTotal = {
            billable: 0,
            nonBillable: 0,
            total: 0
        };

        // Print each day.
        for (let i in dateGroup) {
            let group = dateGroup[i];
            let projGroup = await this.groupEarlyEntriesByProject(group);

            // @todo: Sort by project id to keep reports consistently formatted.

            // Gather the billable summary data for the group.
            let summary = this.getBillableSummary(projGroup);
            summaryTotal.billable += summary.billable;
            summaryTotal.nonBillable += summary.nonBillable;
            summaryTotal.total += summary.total;

            // Print the day's summary.
            let entryDate = group[0].getDate();
            await this.printDaySummary(entryDate, projGroup);
        }

        console.log("\nReport Summary".yellow.bold);
        this.printBillableSummary(summaryTotal);
    }

    /**
     * Print the billable summary data to the console.
     * @param summary
     */
    printBillableSummary(summary) {
        console.log(`    Billable:\t\t${summary.billable} hours`);
        console.log(`    Not Billable:\t${summary.nonBillable} hours`);
        console.log(`    Total:\t\t${summary.total} hours`.bold);
    }

    /**
     * Print a summary of a Noko Time Entry.
     * @param response
     */
    printNokoEntrySummary(response) {
        const hours = `${response.minutes / 60}`;
        const projName = response.project.name;
        const day = response.date;
        const userName = `${response.user.first_name} ${response.user.last_name}`;

        console.log(`${day.bold}: Logged ${hours.bold} hours to ${projName.blue.bold} for ${userName.bold}`);
    }

    /**
     * Generate a summary of billable vs non-billable data for a project.
     * @param {object} projGroup
     * @returns {{total: number, nonBillable: number, billable: number}}
     */
    getBillableSummary(projGroup) {
        const summary = {
            billable: 0,
            nonBillable: 0,
            total: 0
        };

        for (let projId in projGroup) {
            let entries = projGroup[projId].entries;
            let project = projGroup[projId].project;

            if (project.isBillable()) {
                summary.billable += this.sumEarlyEntries(entries);
            } else {
                summary.nonBillable += this.sumEarlyEntries(entries);
            }
        }

        summary.total = summary.billable + summary.nonBillable;

        return summary;
    }

    /**
     * Get the total duration worked from a set of Early entries.
     *
     * @param {array[EarlyEntry]} earlyEntries
     * @returns {number}
     */
    sumEarlyEntries(earlyEntries) {
        let totalTime = 0;

        earlyEntries.forEach(entry => {
            totalTime += entry.getDuration();
        });

        return this.minsToProjHours(totalTime);
    }

    /**
     * Given a number of minutes, convert it to hours using the roundup set in the project config.
     *
     * @param {number} minutes
     * @returns {number}
     */
    minsToProjHours(minutes) {
        return Math.ceilX(minutes, this.config.roundProject) / 60;
    }

    /**
     * Write time entries to Noko grouped by project.
     * @param entries
     * @returns {Promise<void>}
     */
    async submitEntriesToNoko(entries) {
        const dateGroup = this.groupEarlyEntriesByDate(entries);

        for (let i in dateGroup) {
            let projectGroup = await this.groupEarlyEntriesByProject(dateGroup[i]);

            // Add some spacing to the report.
            console.log('');

            for (let projId in projectGroup) {
                let project = projectGroup[projId].project;
                let group = projectGroup[projId];
                let date = group.entries[0].getDate();
                let hours = this.sumEarlyEntries(group.entries);
                let minutes = hours * 60;

                if (project.isValid() && project.isActive()) {
                    let description = this.getTasksFromEarlyEntries(group.entries).join(', ');
                    let timeEntry = new NokoTimeEntry(date, minutes, projId, description);

                    // Create the entry and log the results.
                    await this.nokoApi.createEntry(timeEntry).then(response => {
                        this.printNokoEntrySummary(response);
                    }).catch(err => {
                        console.error(err);
                    });
                } else {
                    console.log(`Skipped ${hours} hour(s) for missing/archived Noko projects.`);
                }
            }
        }
    }

    /**
     * Get an array of unique Noko project IDs mapped to Early activities.
     * @returns {[]}
     */
    getAllProjectIds() {
        return [...new Set(Object.values(this.config.activityProjectMap))];
    }
}

export default Early2Noko;
