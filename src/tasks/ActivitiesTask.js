export class ActivitiesTask {
  static id = 'activities';
  static name = 'activities';
  static description = 'Timeular Activities';
  static weight = 60;
  static chain = true;
  static async execute() {
    console.log('Fetching Timeular activities...');
  }
} 