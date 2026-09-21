// 3rd Party Modules
import { type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { req, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { getFollowing } from "#src/controllers/profile/getFollowing";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("Get Following Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get following users successfully", async () => {
    await getFollowing(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(prisma.user.count).toHaveBeenCalledOnce();
    expect(prisma.user.findMany).toHaveBeenCalledOnce();
  });
});
