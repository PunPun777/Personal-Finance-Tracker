import jwt from 'jsonwebtoken';
import ApiError from './ApiError.js';

/**
 * Sign a JWT for the given userId.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} signed JWT
 */
export const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT.
 * Throws ApiError(401) if the token is invalid or expired.
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError('Your session has expired. Please log in again.', 401);
    }
    throw new ApiError('Invalid token. Please log in again.', 401);
  }
};

/**
 * Extract the Bearer token from the Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};
