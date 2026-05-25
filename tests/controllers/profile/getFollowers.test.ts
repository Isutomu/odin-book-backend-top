// 3rd Party Modules
import { type NextFunction, type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { next, req, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { getFollowers } from "#src/controllers/profile/getFollowers";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("Get Followers Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get followers successfully", async () => {
    await getFollowers(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(prisma.user.count).toHaveBeenCalledOnce();
    expect(prisma.user.findMany).toHaveBeenCalledOnce();
  });
});
