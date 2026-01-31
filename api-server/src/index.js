import 'dotenv/config';
import express from "express";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getSequelize, testConnection, verifySchema} from "./data/database.js";
import logger from "./utils/logger.js";
import * as tasksDao from "./data/models/tasksDao.js";
import { createTaskService } from "./domain/taskService.js";
import { createTaskController } from "./api/controllers/taskController.js";
import { createHealthController } from "./api/controllers/healthController.js";
import routes from "./api/routes/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Format JSON output with indentation (like jq)
app.set('json spaces', 2);

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

const taskService = createTaskService(tasksDao, logger);
const taskController = createTaskController(taskService, logger);
const healthController = createHealthController(logger);


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

    try {
      await testConnection();
      logger.info("Database connection established");
    
      await verifySchema();
      logger.info("Database schema verified");
    } catch (error) {
      logger.error("Startup failed", {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    }
    

    logger.info("API booted with migration-only schema control.");

    // Health check landing page (accessible from browser)
    app.get("/", healthController.getHealth);
    app.get("/health", healthController.getHealth);

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