const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/apiHelpers");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new ApiError(400, errorMessages.join(", "));
  }
  next();
};

module.exports = { validate };
