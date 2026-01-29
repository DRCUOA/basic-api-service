// src/api/controllers/healthController.js

import { getSequelize } from "../../data/database.js";

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
          // Return HTML for browser landing page
          const statusCode = dbStatus === "connected" ? 200 : 503;
          const statusColor = dbStatus === "connected" ? "#22c55e" : "#ef4444";
          const statusText = dbStatus === "connected" ? "Healthy" : "Unhealthy";

          const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Check - Basic API Service</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #1f2937;
      margin-bottom: 30px;
      font-size: 28px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      background-color: ${statusColor};
      color: white;
    }
    .stats-grid {
      display: grid;
      gap: 20px;
      margin-top: 30px;
    }
    .stat-item {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .stat-value {
      font-size: 18px;
      color: #1f2937;
      font-weight: 500;
    }
    .error-message {
      color: #ef4444;
      font-size: 14px;
      margin-top: 8px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>
      Health Check
      <span class="status-badge">${statusText}</span>
    </h1>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Status</div>
        <div class="stat-value">${healthStats.status}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Database</div>
        <div class="stat-value">${healthStats.database.status}</div>
        ${dbError ? `<div class="error-message">${dbError}</div>` : ''}
      </div>
      <div class="stat-item">
        <div class="stat-label">Uptime</div>
        <div class="stat-value">${healthStats.uptime}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Environment</div>
        <div class="stat-value">${healthStats.environment.nodeEnv}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Port</div>
        <div class="stat-value">${healthStats.environment.port}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Timestamp</div>
        <div class="stat-value">${healthStats.timestamp}</div>
      </div>
    </div>
    <div class="footer">
      Basic API Service Health Check
    </div>
  </div>
</body>
</html>
          `;

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
          res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Check Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ef4444;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      text-align: center;
    }
    h1 { margin-bottom: 20px; }
  </style>
</head>
<body>
  <div>
    <h1>Health Check Error</h1>
    <p>Unable to retrieve health status</p>
  </div>
</body>
</html>
          `);
        }
      }
    },
  };
}
