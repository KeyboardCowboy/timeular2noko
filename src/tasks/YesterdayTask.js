export class YesterdayTask {
  static id = 'yesterday';
  static name = 'yesterday';
  static description = "Yesterday's Hours";
  static weight = 20;
  static chain = true;
  static async execute() {
    console.log('Fetching yesterday\'s hours...');
  }
} 