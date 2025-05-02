export class LastWeekTask {
  static id = 'lastWeek';
  static name = "Last Week's Hours";
  static description = "";
  static weight = 40;
  static chain = true;
  static async execute() {
    console.log('Fetching last week\'s hours...');
  }
} 