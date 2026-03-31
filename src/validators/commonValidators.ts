// 3rd Party Modules
import { body } from "express-validator";

export const bodyUsername = () =>
  body("username")
    .trim()
    .notEmpty()
    .withMessage("'username' is required.")
    .isAlphanumeric()
    .withMessage("'username' can only contain letters and numbers.");

export const bodyEmail = () =>
  body("email")
    .notEmpty()
    .withMessage("'email' is required.")
    .matches(
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    )
    .withMessage("must be a valid email.")
    .isLength({ min: 5, max: 45 })
    .withMessage("'email' must be between 5 and 45 characters long.");

export const bodyPassword = () =>
  body("password")
    .notEmpty()
    .withMessage("'password' is required.")
    .isAlphanumeric("en-US", { ignore: " _-*" })
    .withMessage(
      "'password' can only contain letters, numbers, or the following characters: ' ', '_', '-', '*'.",
    )
    .isLength({ min: 6, max: 30 })
    .withMessage("'password' must be between 6 and 30 characters long.");
