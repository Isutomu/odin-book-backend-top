// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import type { CustomNextFunction } from "#src/types/types";
import { CustomError } from "#src/lib/CustomError";

export const isLogged = (
  req: Request,
  _res: Response,
  next: CustomNextFunction,
) => {
  if (!req.user?.id) {
    return next(new CustomError(401, "User not logged"));
  }
  return next();
};
