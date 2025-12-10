class AppError extends Error {
  // Add 3rd parameter: 'errors' (default null)
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Save structured error details (if any)
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
