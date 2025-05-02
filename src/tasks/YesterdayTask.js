export class YesterdayTask {
  static id = 'yesterday';
  static name = "Yesterday's Hours";
  static description = "";
  static weight = 20;
  static chain = true;
  static async execute() {
    console.log('Fetching yesterday\'s hours...');
  }
} 