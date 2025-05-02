/**
 * ThisWeekTask
 * 
 * Fetches and displays time entries for the current week from Timeular.
 * This task is used to review and report on the current week's logged hours and activities.
 * 
 * @typedef {import('@keyboardcowboy/taskprompt').Task} Task
 * @typedef {import('@keyboardcowboy/taskprompt').TaskManager} TaskManager
 * 
 * @type {Task}
 */

export const ThisWeekTask = {
  id: 'thisWeek',
  name: "This Week's Hours",
  description: "",
  weight: 30,
  chain: true,
  async execute(taskManager) {
    console.log('Fetching this week\'s hours...');
  }
}; 