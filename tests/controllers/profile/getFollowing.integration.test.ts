// 3rd Party Modules
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import supertest from "supertest";
import { type Request, type Response, type NextFunction } from "express";

// Local Modules
import { app } from "#tests/helpers/appSetup";
import { prisma } from "#src/lib/prisma";
import { cleanDatabase } from "#tests/helpers/cleanDatabase";
import { errorHandler } from "#src/middlewares/errorHandler";
import {
  addUserToRequest,
  bulkAddUsersAndPostsToDB,
} from "#tests/helpers/integrationTestSetup";
import { getFollowing } from "#src/controllers/profile/getFollowing";

// Constants
const PATH = "/profile/following";
const RESPONSE_DATA_FORMAT = expect.objectContaining({
  followingAmmount: expect.any(Number),
  following: expect.arrayContaining([
    expect.objectContaining({ username: expect.any(String) }),
  ]),
});

// Mocks
const populateDB = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
  next(),
);

app.use(addUserToRequest);
app.use(populateDB);
app.get(PATH, getFollowing);
app.use(errorHandler);
const prismaCountUserSpy = vi.spyOn(prisma.user, "count");
const prismaFindManyUserSpy = vi.spyOn(prisma.user, "findMany");

describe("Get Followed Users Of Logged User", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });
  beforeEach(async () => {
    vi.clearAllMocks();
    await cleanDatabase();
  });
  afterAll(async () => {
    await cleanDatabase();
  });

  describe("Successful Cases", () => {
    it("should get followed users successfully", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual(RESPONSE_DATA_FORMAT);
      expect(prismaCountUserSpy).toHaveBeenCalledOnce();
      expect(prismaFindManyUserSpy).toHaveBeenCalledOnce();
    });

    it("should work even if user doesn't follow anyone", async () => {
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual({
        followingAmmount: 0,
        following: [],
      });
      expect(prismaCountUserSpy).toHaveBeenCalledOnce();
      expect(prismaFindManyUserSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Failure Cases", () => {
    // It could be an error from another prisma call too. Just checking for unexpected errors.
    it("should fail when there is a database error", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      prismaCountUserSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
