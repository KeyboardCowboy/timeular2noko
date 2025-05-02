/**
 * TodayTask
 * 
 * Fetches and displays time entries for the current day from Timeular.
 * This task is used to quickly view today's logged hours and activities.
 * 
 * @typedef {import('@keyboardcowboy/taskprompt').Task} Task
 * @typedef {import('@keyboardcowboy/taskprompt').TaskManager} TaskManager
 * 
 * @type {Task}
 */

export const TodayTask = {
  id: 'today',
  name: "Today's Hours",
  description: "",
  weight: 10,
  chain: true,
  async execute(taskManager) {
    console.log('Fetching today\'s hours...');
  }
}; 