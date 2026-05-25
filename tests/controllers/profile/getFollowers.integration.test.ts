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
import { getFollowers } from "#src/controllers/profile/getFollowers";

// Constants
const PATH = "/profile/followers";
const RESPONSE_DATA_FORMAT = expect.objectContaining({
  followersAmmount: expect.any(Number),
  followers: expect.arrayContaining([
    expect.objectContaining({ username: expect.any(String) }),
  ]),
});

// Mocks
const populateDB = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
  next(),
);

app.use(addUserToRequest);
app.use(populateDB);
app.get(PATH, getFollowers);
app.use(errorHandler);
const prismaCountUserSpy = vi.spyOn(prisma.user, "count");
const prismaFindManyUserSpy = vi.spyOn(prisma.user, "findMany");

describe("Get Feed (With Route Parameter) Integration Tests", () => {
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
    it("should get followers successfully", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual(RESPONSE_DATA_FORMAT);
      expect(prismaCountUserSpy).toHaveBeenCalledOnce();
      expect(prismaFindManyUserSpy).toHaveBeenCalledOnce();
    });

    it("should work even if user has 0 followers", async () => {
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual({
        followersAmmount: 0,
        followers: [],
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
