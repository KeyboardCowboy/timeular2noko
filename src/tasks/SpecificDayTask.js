/**
 * SpecificDayTask
 *
 * Fetches and displays time entries for a specific date from Timeular.
 * This task prompts the user for a date and then retrieves the time entries for that day.
 *
 * @typedef {import('@keyboardcowboy/taskprompt').Task} Task
 * @typedef {import('@keyboardcowboy/taskprompt').TaskManager} TaskManager
 *
 * @type {Task}
 *
 * @typedef {Object} TaskAnswers
 * @property {string} date - The date entered by the user in YYYY-MM-DD format
 */

import inquirer from 'inquirer';
import { getT2N } from '../AppContext.js';

export const SpecificDayTask = {
    id: 'specificDay',
    name: 'Choose Date',
    description: '',
    weight: 50,
    chain: true,
    questions: [
        {
            type: 'input',
            name: 'date',
            message: 'Enter the date (YYYY-MM-DD):',
            validate: (input) => {
                const date = new Date(input);
                return !isNaN(date.getTime()) || 'Please enter a valid date in YYYY-MM-DD format';
            }
        }
    ],
    async execute(taskManager, answers) {
        const T2N = getT2N();

        let date1 = new Date(answers.date);
        date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset());
        date1.setDayStart();

        let date2 = new Date(answers.date);
        date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset());
        date2.setDayEnd();

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
