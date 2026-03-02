/**
 * LastWeekTask
 *
 * Fetches and displays time entries for the previous week from Timeular.
 * This task is used to review and report on the previous week's logged hours and activities.
 *
 * @typedef {import('@keyboardcowboy/taskprompt').Task} Task
 * @typedef {import('@keyboardcowboy/taskprompt').TaskManager} TaskManager
 *
 * @type {Task}
 */

import inquirer from 'inquirer';
import { getT2N } from '../AppContext.js';

export const LastWeekTask = {
    id: 'lastWeek',
    name: "Last Week's Hours",
    description: "",
    weight: 40,
    chain: true,
    async execute(taskManager) {
        const T2N = getT2N();

        const date1 = new Date();
        date1.setWeekStart(-1);

        const date2 = new Date();
        date2.setWeekEnd(-1);

        const entries = await T2N.timeularApi.getTimeEntries(date1, date2);

        if (entries.length === 0) {
            T2N.printEmptyReport();
            return;
        }

        await T2N.printMultiDaySummary(entries);

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
