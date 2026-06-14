export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || error.status || (error.code === 11000 ? 409 : 500)
  const duplicateField = error.code === 11000 ? Object.keys(error.keyPattern || {})[0] : null
  const message = duplicateField ? `${duplicateField} already exists` : error.message

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : message,
  })
}
