// 3rd Party Modules
import { type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { req, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";
import { getProfile } from "#src/controllers/profile/getProfile";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    profile: {
      findFirstOrThrow: vi.fn(),
    },
  },
}));

describe("Get Profile Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get user profile successfully", async () => {
    await getProfile(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(200);
    expect(prisma.profile.findFirstOrThrow).toHaveBeenCalledOnce();
  });
});
