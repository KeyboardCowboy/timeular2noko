#!/usr/bin/env node

import { TaskManager } from '@keyboardcowboy/taskprompt';
import { tasks } from './src/tasks/index.js';

const taskManager = new TaskManager();

// Register our custom tasks
TaskManager.registerTasks(tasks);

taskManager.run();
