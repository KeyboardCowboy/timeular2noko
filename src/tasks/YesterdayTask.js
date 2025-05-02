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

export const YesterdayTask = {
  id: 'yesterday',
  name: "Yesterday's Hours",
  description: "",
  weight: 20,
  chain: true,
  async execute(taskManager) {
    console.log('Fetching yesterday\'s hours...');
  }
}; 