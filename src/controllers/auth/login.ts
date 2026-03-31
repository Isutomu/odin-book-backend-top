// 3rd Party Modules
import type { CustomNextFunction } from "#src/types/types";
import { type Request, type Response } from "express";

// Local Modules
import { passport } from "#src/config/passport";
import { type CustomError } from "#src/lib/CustomError";
import { type User } from "#src/generated/prisma/client";

// CONTROLLER
export const login = (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  passport.authenticate("local", function (err: CustomError, user: User) {
    if (err) {
      return next(err);
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).json({ message: "success" });
    });
  })(req, res, next);
};
