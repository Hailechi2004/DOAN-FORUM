const { ApiError } = require('../utils/apiHelpers');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Convert to ApiError if not already
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Send error response
  const response = {
    success: false,
    message: error.message
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
