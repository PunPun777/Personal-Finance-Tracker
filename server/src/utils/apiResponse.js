/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} data
 */
export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response (used only in non-middleware contexts).
 * Prefer throwing ApiError and letting the global handler respond.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 */
export const sendError = (
  res,
  statusCode = 500,
  message = "Something went wrong",
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
