// 3rd Party Modules
import { type Request, type Response } from "express";
import { validationResult } from "express-validator";

// Local Modules
import type { CustomNextFunction } from "#src/types/types";

export const fieldValidation = (
  req: Request,
  _res: Response,
  next: CustomNextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ statusCode: 422, message: errors.array() });
  }
  return next();
};
