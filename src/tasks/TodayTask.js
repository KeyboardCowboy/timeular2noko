export class TodayTask {
  static id = 'today';
  static name = "Today's Hours";
  static description = "";
  static weight = 10;
  static chain = true;
  static async execute() {
    console.log('Fetching today\'s hours...');
  }
} 