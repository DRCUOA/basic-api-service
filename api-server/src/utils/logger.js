import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    winston.format.json() // Log in JSON format
  ),
  transports: [
    new winston.transports.File({ 
      // log errors to a separate file
      filename: '../logs/error.log', level: 'error' }), 
    new winston.transports.File({
      // log all logs to a combined log file
      filename: '../logs/combined.log'}),
    ],
  });

  // if not in production, log to the console
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }));
  }

  export default logger;
