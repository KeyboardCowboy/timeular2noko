#!/usr/bin/env node

import './src/prototype.js';
import './lib/Date.prototype.js';
import { TaskManager } from '@keyboardcowboy/taskprompt';
import { tasks } from './src/tasks/index.js';
import { initApp } from './src/AppContext.js';

await initApp();

const taskManager = new TaskManager();
taskManager.registerTasks(tasks);
taskManager.run();
