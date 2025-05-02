export class SpecificDayTask {
  static id = 'specificDay';
  static name = 'specificDay';
  static description = 'Specific Day';
  static weight = 50;
  static chain = true;
  static questions = [
    {
      type: 'input',
      name: 'date',
      message: 'Enter the date (YYYY-MM-DD):',
      validate: (input) => {
        const date = new Date(input);
        return !isNaN(date.getTime()) || 'Please enter a valid date in YYYY-MM-DD format';
      }
    }
  ];
  static async execute(taskManager, answers) {
    console.log(`Fetching hours for ${answers.date}...`);
  }
} 