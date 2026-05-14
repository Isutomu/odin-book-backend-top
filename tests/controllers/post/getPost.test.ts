// 3rd Party Modules
import { type NextFunction, type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { next, req, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";
import { getPost } from "#src/controllers/post/getPost";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    post: {
      findFirstOrThrow: vi.fn(),
    },
  },
}));

describe("Get Post Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get a post successfully", async () => {
    await getPost(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(prisma.post.findFirstOrThrow).toHaveBeenCalledOnce();
  });

  it("should not get a post if its id is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2025",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.post.findFirstOrThrow).mockRejectedValueOnce(prismaError);
    await getPost(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });
});
