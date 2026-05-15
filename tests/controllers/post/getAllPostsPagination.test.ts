// 3rd Party Modules
import { type NextFunction, type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { next, req, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";
import { getAllPostsPagination } from "#src/controllers/post/getAllPostsPagination";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    user: { findFirstOrThrow: vi.fn() },
    post: { findFirstOrThrow: vi.fn(), findMany: vi.fn() },
  },
}));

describe("Get All Posts Pagination Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get all posts from an user successfully", async () => {
    await getAllPostsPagination(
      req as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(prisma.user.findFirstOrThrow).toHaveBeenCalledOnce();
    expect(prisma.post.findFirstOrThrow).toHaveBeenCalledOnce();
    expect(prisma.post.findMany).toHaveBeenCalledOnce();
  });

  it("should not get posts if its user is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2025",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.user.findFirstOrThrow).mockRejectedValueOnce(prismaError);
    await getAllPostsPagination(
      req as Request,
      res as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });

  it("should not get posts if lastPostId is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2025",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.user.findFirstOrThrow).mockRejectedValueOnce(prismaError);
    await getAllPostsPagination(
      req as Request,
      res as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });
});
