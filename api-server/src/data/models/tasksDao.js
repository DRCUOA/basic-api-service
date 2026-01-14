import Task from './Task.js';
import logger from '../../utils/logger.js';

export async function retrieveAllTasks() {
  try {
    const tasks = await Task.findAll();
    return tasks.map(task => task.toJSON());
  } catch (error) {
    logger.error('Error retrieving all tasks', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function retrieveTaskById(id) {
  try {
    const task = await Task.findByPk(id);
    return task ? task.toJSON() : null;
  } catch (error) {
    logger.error('Error retrieving task by ID', {
      id,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function createTask(taskData) {
  try {
    const task = await Task.create(taskData);
    return task.toJSON();
  } catch (error) {
    logger.error('Error creating task', {
      taskData,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function updateTask(id, updates) {
  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return null;
    }
    await task.update(updates);
    return task.toJSON();
  } catch (error) {
    logger.error('Error updating task', {
      id,
      updates,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function deleteTask(id) {
  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return false;
    }
    await task.destroy();
    return true;
  } catch (error) {
    logger.error('Error deleting task', {
      id,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}