export class ThisWeekTask {
  static id = 'thisWeek';
  static name = "This Week's Hours";
  static description = "";
  static weight = 30;
  static chain = true;
  static async execute() {
    console.log('Fetching this week\'s hours...');
  }
} 