// 3rd Party Modules
import { type Request, type Response, type NextFunction } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "#src/generated/prisma/client";

// Local Modules
import { signup } from "#src/controllers/auth/signup";
import { next, reqAuthLogin, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

describe("Signup User Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an user successfully", async () => {
    await signup(
      reqAuthLogin as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(201);
    expect(res.json).toHaveBeenCalledOnce();
    expect(prisma.user.create).toHaveBeenCalledOnce();
  });

  it("should not create an user when the username/email already is being used", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2002",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.user.create).mockRejectedValueOnce(prismaError);
    await signup(
      reqAuthLogin as Request,
      res as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        statusCode: 409,
      }),
    );
  });

  // It could be an error from bcryptjs too. Just checking for unexpected errors.
  it("should not create an user when there is a database error", async () => {
    vi.mocked(prisma.user.create).mockRejectedValueOnce(
      new Error("Database error"),
    );
    await expect(
      signup(reqAuthLogin as Request, res as Response, next as NextFunction),
    ).rejects.toThrow();
  });
});
