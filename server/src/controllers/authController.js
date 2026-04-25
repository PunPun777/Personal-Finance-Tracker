import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
    });

    sendSuccess(res, 201, "Account created successfully.", { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    sendSuccess(res, 200, "Logged in successfully.", { user, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    sendSuccess(res, 200, "User profile fetched.", { user });
  } catch (error) {
    next(error);
  }
};
