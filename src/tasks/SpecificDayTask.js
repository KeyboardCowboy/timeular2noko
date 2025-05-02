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
    console.log(`Fetching hours for ${answers.date}...`);
  }
}; 