import * as taskService from "../../domain/taskService.js";
import logger from "../../utils/logger.js";

export async function listTasks(req, res) {
  try {
    const tasks = await taskService.listTasks();
    logger.info(`Tasks listed successfully: ${tasks.length} tasks`);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error("Error listing tasks", { 
      message: error.message, 
      stack: error.stack,
      path: req.originalUrl 
    });

    res.status(500).json({
      error: "Failed to list tasks. Please try again later or contact support."
    });
  }
}

export async function createTask(req, res) {
  try {
    const task = await taskService.createTask(req.body);
    logger.info(`Task created successfully: ${task.id}`);
    res.status(201).json(task);
  } catch (error) {
    logger.error("Error creating task", { 
      message: error.message, 
      stack: error.stack,
      path: req.originalUrl 
    });
  }
} 

export async function updateTasks(req, res) {
  try {
    const task = await taskService.updateTasks(req.params.id, req.body);
    logger.info(`Task updated successfully: ${task.id}`);
    res.status(200).json(task);
  } catch (error) {
    logger.error("Error updating task", { 
      message: error.message, 
      stack: error.stack,
      path: req.originalUrl 
    });
  }
}

export async function deleteTasks(req, res) {
  try {
    await taskService.deleteTasks(req.params.id);
    logger.info(`Task deleted successfully: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting task", { 
      message: error.message, 
      stack: error.stack,
      path: req.originalUrl 
    });
  }
} 