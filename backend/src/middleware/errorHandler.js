const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      message: 'The requested resource was not found'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid input data',
      details: errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please log in again'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'File size exceeds the limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file',
      message: 'Unexpected file field'
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
      code: err.code
    });
  }

  // Cloudinary errors
  if (err.http_code) {
    return res.status(err.http_code).json({
      error: 'Cloudinary error',
      message: err.message,
      code: err.error?.type || 'CLOUDINARY_ERROR'
    });
  }

  // OpenAI errors
  if (err.type === 'insufficient_quota') {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'AI service is temporarily unavailable'
    });
  }

  // Default error response
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: process.env.NODE_ENV === 'development' ? err.name : 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
