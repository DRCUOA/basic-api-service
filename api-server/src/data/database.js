// runtime configuration for Sequelize
import { Sequelize } from "sequelize";
import logger from "../utils/logger.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: (msg) => logger.info(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

/**
 * 🔒 HARD BLOCK: prevent schema mutation at runtime
 * This poisons sync() so any attempt to call it will crash the app immediately.
 * This is correct behavior - schema changes must use migrations via sequelize-cli.
 */
sequelize.sync = () => {
  throw new Error(
    "sequelize.sync() is forbidden. Use migrations via sequelize-cli."
  );
};

// Environment-based hard rule for extra safety
if (process.env.NODE_ENV === "production") {
  sequelize.sync = () => {
    throw new Error("sync() forbidden in production");
  };
}

export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully.");
    return true;
  } catch (error) {
    logger.error("Unable to connect to database", {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

/**
 * Export ONLY what the app needs
 * This sealed interface prevents direct access to sync() outside this module.
 */
export function getSequelize() {
  return sequelize;
}
