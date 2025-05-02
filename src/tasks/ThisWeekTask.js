export class ThisWeekTask {
  static id = 'thisWeek';
  static name = 'thisWeek';
  static description = "This Week's Hours";
  static weight = 30;
  static chain = true;
  static async execute() {
    console.log('Fetching this week\'s hours...');
  }
} 