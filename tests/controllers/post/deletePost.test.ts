// 3rd Party Modules
import { type NextFunction, type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { deletePost } from "#src/controllers/post/deletePost";
import { next, reqDeletePost, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    post: {
      delete: vi.fn(),
    },
  },
}));

describe("Delete Posts Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a post successfully", async () => {
    await deletePost(
      reqDeletePost as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
    expect(prisma.post.delete).toHaveBeenCalledOnce();
  });

  it("should not delete a post if its id is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2025",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.post.delete).mockRejectedValueOnce(prismaError);
    await deletePost(
      reqDeletePost as Request,
      res as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });

  // It could be an error from bcryptjs too. Just checking for unexpected errors.
  it("should not create a post when there is a database error", async () => {
    vi.mocked(prisma.post.delete).mockRejectedValueOnce(
      new Error("Database error"),
    );
    await expect(
      deletePost(
        reqDeletePost as Request,
        res as Response,
        next as NextFunction,
      ),
    ).rejects.toThrow();
  });
});
