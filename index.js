#!/usr/bin/env node

import './src/prototype.js';
import './lib/Date.prototype.js';
import { program } from 'commander';
import { TaskManager } from '@keyboardcowboy/taskprompt';
import { tasks } from './src/tasks/index.js';
import { initApp } from './src/AppContext.js';

// Grab any user provided options.
program
    .option('-d, --debug', 'Log API requests and cache activity.')
    .parse(process.argv);

await initApp(program.opts());

const taskManager = new TaskManager();
taskManager.registerTasks(tasks);
taskManager.run();
