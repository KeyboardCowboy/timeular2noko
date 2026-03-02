/**
 * YesterdayTask
 *
 * Fetches and displays time entries for the previous day from Timeular.
 * This task is used to review and report on yesterday's logged hours and activities.
 *
 * @typedef {import('@keyboardcowboy/taskprompt').Task} Task
 * @typedef {import('@keyboardcowboy/taskprompt').TaskManager} TaskManager
 *
 * @type {Task}
 */

import inquirer from 'inquirer';
import { getT2N } from '../AppContext.js';

export const YesterdayTask = {
    id: 'yesterday',
    name: "Yesterday's Hours",
    description: "",
    weight: 20,
    chain: true,
    async execute(taskManager) {
        const T2N = getT2N();

        const date1 = new Date();
        date1.setDayStart(-1);

        const date2 = new Date();
        date2.setDayEnd(-1);

        const entries = await T2N.timeularApi.getTimeEntries(date1, date2);

        if (entries.length === 0) {
            T2N.printEmptyReport();
            return;
        }

        const projGroup = await T2N.groupTimeularEntriesByProject(entries);
        await T2N.printDaySummary(entries[0].getDate(), projGroup);

        console.log('');
        const { send } = await inquirer.prompt([{
            type: 'confirm',
            name: 'send',
            message: 'Submit to Noko?'
        }]);

        if (send) {
            await T2N.submitEntriesToNoko(entries);
        }
    }
};
