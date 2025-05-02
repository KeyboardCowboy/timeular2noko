export class LastWeekTask {
  static id = 'lastWeek';
  static name = 'lastWeek';
  static description = "Last Week's Hours";
  static weight = 40;
  static chain = true;
  static async execute() {
    console.log('Fetching last week\'s hours...');
  }
} 