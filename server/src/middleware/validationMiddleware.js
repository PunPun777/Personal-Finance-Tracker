import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(messages.join(". "), 400));
  }

  next();
};

export default validate;
