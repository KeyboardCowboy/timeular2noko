export class TodayTask {
  static id = 'today';
  static name = 'today';
  static description = "Today's Hours";
  static weight = 10;
  static chain = true;
  static async execute() {
    console.log('Fetching today\'s hours...');
  }
} 