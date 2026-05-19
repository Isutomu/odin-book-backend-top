// 3rd Party Modules
import { type NextFunction, type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { getFeedPagination } from "#src/controllers/post/getFeedPagination";
import { next, req, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";

const POST_FIND_MANY_RESOLVED_VALUE = [0, 1, 2];
vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    user: {
      findMany: vi.fn(() => [{ id: "1" }, { id: "2" }, { id: "3" }]),
    },
    post: {
      findFirstOrThrow: vi.fn(),
      findMany: vi.fn(() => POST_FIND_MANY_RESOLVED_VALUE),
    },
  },
}));

describe("Get Feed Pagination Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get feed's posts successfully", async () => {
    await getFeedPagination(
      req as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith({
      message: "success",
      data: POST_FIND_MANY_RESOLVED_VALUE,
    });
    expect(prisma.user.findMany).toHaveBeenCalledOnce();
    expect(prisma.post.findMany).toHaveBeenCalledOnce();
  });

  it("should return an empty data array if no user is followed", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    await getFeedPagination(
      req as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith({
      message: "success",
      data: [],
    });
    expect(prisma.user.findMany).toHaveBeenCalledOnce();
    expect(prisma.post.findMany).not.toHaveBeenCalledOnce();
  });

  it("should return an empty data array if followers used don't have posts", async () => {
    vi.mocked(prisma.post.findMany).mockResolvedValueOnce([]);
    await getFeedPagination(
      req as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(res.json).toHaveBeenCalledExactlyOnceWith({
      message: "success",
      data: [],
    });
    expect(prisma.user.findMany).toHaveBeenCalledOnce();
    expect(prisma.post.findMany).toHaveBeenCalledOnce();
  });

  it("should not get posts if lastPostId is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2025",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.post.findFirstOrThrow).mockRejectedValueOnce(prismaError);
    await getFeedPagination(
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
