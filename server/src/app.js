import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import globalErrorHandler from "./middlewares/errorMiddleware.js";
import AppError from "./utils/appError.js";
import { StatusCodes } from "http-status-codes";

const app = express();

// Security HTTP Headers
app.use(helmet());

// Logging development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS (So that the frontend can access the backend)
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); // Limit max body to 10kb for plain json

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Routes
app.get("/", (req, res) => {
  res.send("API InkCuba is running...");
});

// Handle Undefined Routes (404)
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
