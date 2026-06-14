export function sendData(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  })
}

export function createHttpError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}
