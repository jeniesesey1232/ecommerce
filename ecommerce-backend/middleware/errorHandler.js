export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  const isDev = process.env.NODE_ENV !== 'production'

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: isDev ? err.message : undefined
    })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    })
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Resource already exists'
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    })
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: isDev ? err.stack : undefined
  })
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
