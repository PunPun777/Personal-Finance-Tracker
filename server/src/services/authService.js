import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

export const registerUser = async ({ name, email, password }) => {
  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new ApiError("Invalid email or password.", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError("Invalid email or password.", 401);
  }

  const token = signToken(user._id);

  user.password = undefined;

  return { user, token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError("User not found.", 404);
  }
  return user;
};
