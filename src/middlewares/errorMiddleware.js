import ApiError from "../utils/ApiError.js";

const globalErrorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback for unknown errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default globalErrorHandler;
