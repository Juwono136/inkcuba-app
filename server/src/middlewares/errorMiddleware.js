import { StatusCodes } from "http-status-codes";
import AppError from "../utils/appError.js";
import logger from "../utils/logger.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : "Duplicate value";
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleZodError = (err) => {
  const issues = err.issues || err.errors;

  const errorDetails = {};

  // Loop every issue of Zod
  issues.forEach((issue) => {
    // issue.path is an array, e.g. ['academicInfo', 'batch']
    const fieldName = issue.path.join(".");

    // Insert into object: { "email": "Invalid email", "name": "Too short" }
    errorDetails[fieldName] = issue.message;
  });

  // Send a generic "Validation Error" message, but include an errorDetails object
  return new AppError("Validation Error", StatusCodes.BAD_REQUEST, errorDetails);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", StatusCodes.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", StatusCodes.UNAUTHORIZED);

// MAIN ERROR HANDLER
const globalErrorHandler = (err, req, res, next) => {
  // Make a copy of the error
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Make sure Zod/Mongoose specific properties are copied.
  if (err.issues) error.issues = err.issues;
  if (err.errors) error.errors = err.errors;

  // change error.statusCode become 400 atau 401
  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "ZodError") error = handleZodError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // If it passes Zod etc, it means this is a real server error/coding bug
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // System Error (500) - Full detailed log (Stack Trace)
  if (error.statusCode === 500) {
    logger.error("SYSTEM ERROR:", err);
  }
  // Validation/Operational Error (400/401) - Short log only (One-liner)
  else if (process.env.NODE_ENV === "development") {
    logger.warn(`${error.statusCode} - ${error.message}`);
  }

  // Send Response to Frontend
  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
    errors: error.errors,
    // Stack trace only if error 500
    stack:
      process.env.NODE_ENV === "development" && error.statusCode === 500 ? err.stack : undefined,
  });
};

export default globalErrorHandler;
