// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import type { CustomNextFunction } from "#src/types/types";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: CustomNextFunction,
) => {
  return res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Internal Server Error" });
};
