import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Save the error in the error.log file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Save the error in the combined.log file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If not in production, also display it in the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
