import 'dotenv/config';
import express from "express";
import { getSequelize, testConnection } from "./data/database.js";
import logger from "./utils/logger.js";
import * as tasksDao from "./data/models/tasksDao.js";
import { createTaskService } from "./domain/taskService.js";
import { createTaskController } from "./api/controllers/taskController.js";
import routes from "./api/routes/routes.js";


const app = express();
app.use(express.json());

const taskService = createTaskService(tasksDao, logger);
const taskController = createTaskController(taskService, logger);


async function initializeApp() {
  try {
    const sequelize = getSequelize();

    // Defensive assertion: ensure sync() is poisoned
    // If sync() exists but doesn't throw the expected error, something is wrong
    if (typeof sequelize.sync === "function") {
      try {
        sequelize.sync();
        // If we get here, sync() didn't throw - this is a problem!
        throw new Error(
          "Runtime schema mutation detected. sync() must be poisoned."
        );
      } catch (error) {
        // Good! sync() threw an error. Verify it's our poison error.
        if (!error.message.includes("forbidden")) {
          throw new Error(
            "sync() exists but is not properly poisoned. Expected forbidden error."
          );
        }
        // sync() is properly poisoned, continue
      }
    }

    const connected = await testConnection();
    if (!connected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    logger.info("API booted with migration-only schema control.");

    app.use("/api", routes({ taskController }));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize application', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

initializeApp();