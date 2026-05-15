// 3rd Party Modules
import { type NextFunction, type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { createPost } from "#src/controllers/post/createPost";
import {
  next,
  reqCreatePost,
  reqUpdatePost,
  res,
} from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { updatePost } from "#src/controllers/post/updatePost";
import { Prisma } from "#src/generated/prisma/client";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    post: {
      update: vi.fn(),
    },
  },
}));

describe("Update Post Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a post successfully", async () => {
    await updatePost(
      reqUpdatePost as Request,
      res as Response,
      next as NextFunction,
    );
    expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
    expect(prisma.post.update).toHaveBeenCalledOnce();
  });

  it("should not update a post if its id is not found", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("error", {
      code: "P2025",
      clientVersion: "",
      batchRequestIdx: 0,
      meta: {},
    });
    vi.mocked(prisma.post.update).mockRejectedValueOnce(prismaError);
    await updatePost(
      reqUpdatePost as Request,
      res as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });

  it("should not update a post when there is a database error", async () => {
    vi.mocked(prisma.post.update).mockRejectedValueOnce(
      new Error("Database error"),
    );
    await expect(
      updatePost(
        reqUpdatePost as Request,
        res as Response,
        next as NextFunction,
      ),
    ).rejects.toThrow();
  });
});
