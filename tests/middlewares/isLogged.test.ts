// 3rd Party Modules
import { type Request, type Response, type NextFunction } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { isLogged } from "#src/middlewares/isLogged";
import {
  next,
  reqAuthLogin,
  reqIsLogged,
  res,
} from "#tests/helpers/unitTestSetup";
import { CustomError } from "#src/lib/CustomError";

describe("Signup User Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call next without argument if an user was added to req.user", async () => {
    isLogged(reqIsLogged as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it("should call next with a CustomError if an user was not added to req.user", async () => {
    const customError = new CustomError(401, "User not logged");
    const reqIsLoggedWithoutUser = { ...reqAuthLogin };
    delete reqIsLoggedWithoutUser["user"];
    isLogged(
      reqIsLoggedWithoutUser as Request,
      res as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledExactlyOnceWith(customError);
  });
});
