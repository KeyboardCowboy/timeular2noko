/**
 * ActivitiesTask
 * 
 * Fetches and displays all available activities from Timeular.
 * This task is used to view and manage the list of activities that can be tracked.
 * 
 * @typedef {import('@keyboardcowboy/taskprompt').Task} Task
 * @typedef {import('@keyboardcowboy/taskprompt').TaskManager} TaskManager
 * 
 * @type {Task}
 */

export const ActivitiesTask = {
  id: 'activities',
  name: 'Timeular Activities',
  description: '',
  weight: 60,
  chain: true,
  async execute(taskManager) {
    console.log('Fetching Timeular activities...');
  }
}; 