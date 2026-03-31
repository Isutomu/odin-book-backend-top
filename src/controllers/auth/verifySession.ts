// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import type { CustomNextFunction } from "#src/types/types";
import { isLogged } from "#src/middlewares/isLogged";

export const verifySession = [
  isLogged,
  (_req: Request, res: Response, _next: CustomNextFunction) =>
    res.status(200).json({ message: "success" }),
];
