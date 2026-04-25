import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { extractBearerToken, verifyToken } from "../utils/jwt.js";

const protect = async (req, _res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return next(new ApiError("Access denied. No token provided.", 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(
        new ApiError("The user belonging to this token no longer exists.", 401),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
