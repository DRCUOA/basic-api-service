// src/api/controllers/healthController.js

import { getSequelize } from "../../data/database.js";
import { renderTemplate } from "../../utils/templateRenderer.js";

const startTime = Date.now();

export function createHealthController(logger) {
  return {
    async getHealth(req, res) {
      try {
        const sequelize = getSequelize();
        
        // Test database connection
        let dbStatus = "unknown";
        let dbError = null;
        try {
          await sequelize.authenticate();
          dbStatus = "connected";
        } catch (error) {
          dbStatus = "disconnected";
          dbError = error.message;
          logger.error("Health check: Database connection failed", {
            message: error.message,
          });
        }

        const uptime = Math.floor((Date.now() - startTime) / 1000); // seconds
        const healthStats = {
          status: dbStatus === "connected" ? "healthy" : "unhealthy",
          timestamp: new Date().toISOString(),
          uptime: `${uptime}s`,
          database: {
            status: dbStatus,
            ...(dbError && { error: dbError }),
          },
          environment: {
            nodeEnv: process.env.NODE_ENV || "development",
            port: process.env.PORT || 3000,
          },
        };

        // Check if client wants JSON (API check) or HTML (browser)
        const acceptsJson = req.headers.accept?.includes("application/json");

        if (acceptsJson) {
          // Return JSON for API health checks
          const statusCode = dbStatus === "connected" ? 200 : 503;
          res.status(statusCode).json(healthStats);
        } else {
          // Return HTML for browser landing page using template
          const statusCode = dbStatus === "connected" ? 200 : 503;
          const statusColor = dbStatus === "connected" ? "#22c55e" : "#ef4444";
          const statusText = dbStatus === "connected" ? "Healthy" : "Unhealthy";
          
          const dbErrorHtml = dbError 
            ? `<div class="error-message">${dbError}</div>` 
            : '';

          const html = renderTemplate('health', {
            STATUS_COLOR: statusColor,
            STATUS_TEXT: statusText,
            STATUS: healthStats.status,
            DB_STATUS: healthStats.database.status,
            DB_ERROR: dbErrorHtml,
            UPTIME: healthStats.uptime,
            NODE_ENV: healthStats.environment.nodeEnv,
            PORT: healthStats.environment.port,
            TIMESTAMP: healthStats.timestamp,
          });

          res.status(statusCode).send(html);
        }

        logger.info("Health check requested", {
          status: healthStats.status,
          dbStatus: dbStatus,
          path: req.originalUrl,
        });
      } catch (error) {
        logger.error("Error in health check", {
          message: error.message,
          stack: error.stack,
          path: req.originalUrl,
        });

        const errorResponse = {
          status: "error",
          timestamp: new Date().toISOString(),
          error: "Health check failed",
        };

        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
          res.status(500).json(errorResponse);
        } else {
          // Return HTML error page using template
          const html = renderTemplate('health-error');
          res.status(500).send(html);
        }
      }
    },
  };
}
