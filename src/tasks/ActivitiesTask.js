export class ActivitiesTask {
  static id = 'activities';
  static name = 'Timeular Activities';
  static description = '';
  static weight = 60;
  static chain = true;
  static async execute() {
    console.log('Fetching Timeular activities...');
  }
} 