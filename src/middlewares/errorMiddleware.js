import { AppError } from '../utils/AppError.js';
import { errorResponse } from '../utils/errorResponse.js';

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered.';
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired. Please log in again.';
    error = new AppError(message, 401);
  }

  errorResponse(res, error.statusCode || 500, error.message || 'Server Error');
};

export default errorMiddleware;