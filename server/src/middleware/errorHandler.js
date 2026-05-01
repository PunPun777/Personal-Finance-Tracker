import ApiError from "../utils/ApiError.js";
const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    error = new ApiError(`Resource not found with id: ${err.value}`, 404);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(messages.join(". "), 400);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(
      `An account with ${field} "${value}" already exists.`,
      409,
    );
  }

  if (error.statusCode >= 500) {
    console.error("🔥 Server Error:", err);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const message =
    isProduction && !err.isOperational
      ? "Internal Server Error"
      : error.message || "Internal Server Error";

  return res.status(error.statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
