// 3rd Party Modules
import { type Request, type Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Local Modules
import { patchDescription } from "#src/controllers/profile/patchDescription";
import { reqPatchDescription, res } from "#tests/helpers/unitTestSetup";
import { prisma } from "#src/lib/prisma";

vi.mock("@src/lib/prisma.ts", () => ({
  prisma: {
    profile: {
      update: vi.fn(),
    },
  },
}));

describe("Create Post Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a description successfully", async () => {
    await patchDescription(reqPatchDescription as Request, res as Response);
    expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
    expect(res.json).toHaveBeenCalledOnce();
    expect(prisma.profile.update).toHaveBeenCalledOnce();
  });

  // It could be an error from bcryptjs too. Just checking for unexpected errors.
  it("should not update a description when there is a database error", async () => {
    vi.mocked(prisma.profile.update).mockRejectedValueOnce(
      new Error("Database error"),
    );
    await expect(
      patchDescription(reqPatchDescription as Request, res as Response),
    ).rejects.toThrow();
  });
});
