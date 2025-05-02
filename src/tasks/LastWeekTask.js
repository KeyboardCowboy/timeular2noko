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

export const LastWeekTask = {
  id: 'lastWeek',
  name: "Last Week's Hours",
  description: "",
  weight: 40,
  chain: true,
  async execute(taskManager) {
    console.log('Fetching last week\'s hours...');
  }
}; 