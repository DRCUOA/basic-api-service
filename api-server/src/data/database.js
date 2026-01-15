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
 * HARD BLOCK: prevent schema mutation at runtime (per GH issue 5)
 */
sequelize.sync = () => {
  throw new Error(
    "sequelize.sync() is forbidden. Use migrations via sequelize-cli."
  );
};

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
