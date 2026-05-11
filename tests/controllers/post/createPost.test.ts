// 3rd Party Modules
import { type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { createPost } from "#src/controllers/post/createPost";
import { reqCreatePost, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    post: {
      create: vi.fn(),
    },
  },
}));

describe("Create Post Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a post successfully", async () => {
    await createPost(reqCreatePost as Request, res as Response);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(201);
    expect(res.json).toHaveBeenCalledOnce();
    expect(prisma.post.create).toHaveBeenCalledOnce();
  });

  // It could be an error from bcryptjs too. Just checking for unexpected errors.
  it("should not create a post when there is a database error", async () => {
    vi.mocked(prisma.post.create).mockRejectedValueOnce(
      new Error("Database error"),
    );
    await expect(
      createPost(reqCreatePost as Request, res as Response),
    ).rejects.toThrow();
  });
});
