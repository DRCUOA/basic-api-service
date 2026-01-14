// src/domain/taskService.js

export function createTaskService(tasksDao, logger) {
  return {
    async listTasks() {
      try {
        const tasks = await tasksDao.retrieveAllTasks();
        return tasks;
      } catch (error) {
        logger.error("Error listing tasks", {
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },

    async createTask(taskData) {
      try {
        if (!taskData.title || taskData.title.trim().length === 0) {
          throw new Error("Task title is required");
        }
        const task = await tasksDao.createTask(taskData);
        return task;
      } catch (error) {
        logger.error("Error creating task", {
          taskData,
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },

    async updateTasks(id, updates) {
      try {
        const task = await tasksDao.updateTask(id, updates);
        if (!task) {
          throw new Error(`Task with id ${id} not found`);
        }
        return task;
      } catch (error) {
        logger.error("Error updating task", {
          id,
          updates,
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },

    async deleteTasks(id) {
      try {
        const deleted = await tasksDao.deleteTask(id);
        if (!deleted) {
          throw new Error(`Task with id ${id} not found`);
        }
        return { success: true };
      } catch (error) {
        logger.error("Error deleting task", {
          id,
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },
  };
}
