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
      idle: 10000,
    },
  }
);

/**
 * 🔒 HARD BLOCK: prevent schema mutation at runtime
 */
sequelize.sync = () => {
  throw new Error(
    "sequelize.sync() is forbidden. Use migrations via sequelize-cli."
  );
};

if (process.env.NODE_ENV === "production") {
  sequelize.sync = () => {
    throw new Error("sync() forbidden in production");
  };
}

export async function testConnection() {
  await sequelize.authenticate();
  logger.info("Database connection established successfully.");
}

export async function verifySchema() {
  const [results] = await sequelize.query(
    `
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
    `
  );

  if (results[0].count === "0") {
    throw new Error('Required table "tasks" does not exist');
  }
}

/**
 * Export ONLY what the app needs
 */
export function getSequelize() {
  return sequelize;
}
