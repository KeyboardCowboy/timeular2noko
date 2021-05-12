require('./src/dateUtil');
const program = require('commander');
const config = require('./config');
const timeularApi = require('./src/timeular');
const report = require('./src/report');

// Grab any user provided variables.
program
    .option("-r, --report <string>", 'The report to run.')
    .option("-o, --roundUp <int>", "Round each time entry up by this increment.  Defaults to 10 minutes.")
    .parse(process.argv);
const options = program.opts();

// Default time entry rounding up to 10 minute increments.
config.roundUp = config.roundUp || 10;

// Get a listing of all Timeular activities for the account.
if (options.report === "activities") {
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        timeularApi.getActivities(token).then(response => {
            console.log(response);
        });
    }).catch(err => {
        console.error(err);
    });
}
// Get a report of today's completed time tasks.
else if (options.report === "today") {
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        let date1 = new Date();
        date1.setTodayStart();

        let date2 = new Date();
        date2.setTodayEnd();

        // @todo: Generalize this for all reports.
        timeularApi.getTimeEntries(token, date1, date2).then(response => {
            report.printByDate(response.timeEntries, config);
        });
    }).catch(err => {
        console.error(err);
    });
}
// Get a report of yesterday's completed time tasks.
else if (options.report === "yesterday") {
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        let date1 = new Date();
        date1.setTodayStart(-1);

        let date2 = new Date();
        date2.setTodayEnd(-1);

        timeularApi.getTimeEntries(token, date1, date2).then(response => {
            report.printByDate(response.timeEntries, config);
        });
    }).catch(err => {
        console.error(err);
    });
}
// Run a report for this week's data.
else if (options.report === "thisweek")
{
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        let date1 = new Date();
        date1.setWeekStart();

        let date2 = new Date();
        date2.setWeekEnd();

        timeularApi.getTimeEntries(token, date1, date2).then(response => {
            report.printByDate(response.timeEntries, config);
        });
    }).catch(err => {
        console.error(err);
    });
}
// Run a report for last week's data.
else if (options.report === "lastweek") {
    timeularApi.connect(config.apiKey, config.apiSecret).then(token => {
        let date1 = new Date();
        date1.setWeekStart(-1);

        let date2 = new Date();
        date2.setWeekEnd(-1);

        timeularApi.getTimeEntries(token, date1, date2).then(response => {
            report.printByDate(response.timeEntries, config);
        });
    }).catch(err => {
        console.error(err);
    });
}
else {
    console.log('No report selected.');
}