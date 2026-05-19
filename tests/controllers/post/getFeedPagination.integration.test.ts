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
  bulkAddUsersAndPostsToDBNoFollowers,
} from "#tests/helpers/integrationTestSetup";
import { getFeedPagination } from "#src/controllers/post/getFeedPagination";

// Constants
const PATH = "/post/feed/pagination/post10";
const PATH_SUPERTEST = "/post/feed/pagination/:lastPostId";
const PATH_SUPERTEST_WRONG_ID = "/post/feed/pagination/WRONGID";
const RESPONSE_DATA_FORMAT = {
  id: expect.any(String),
  content: expect.any(String),
  publishedAt: expect.any(String),
  updatedAt: null,
  author: { username: expect.any(String) },
};

// Mocks
const populateDB = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
  next(),
);

app.use(addUserToRequest);
app.use(populateDB);
app.get(PATH_SUPERTEST, getFeedPagination);
app.use(errorHandler);
const prismaFindManyUserSpy = vi.spyOn(prisma.user, "findMany");
const prismaFindManyPostSpy = vi.spyOn(prisma.post, "findMany");

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
    it("should get feed's posts successfully", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining(RESPONSE_DATA_FORMAT)]),
      );
      expect(prismaFindManyUserSpy).toHaveBeenCalledOnce();
      expect(prismaFindManyPostSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when the post id is invalid", async () => {
        vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
        const response = await supertest(app).get(PATH_SUPERTEST_WRONG_ID);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(prismaFindManyUserSpy).not.toHaveBeenCalledOnce();
        expect(prismaFindManyPostSpy).not.toHaveBeenCalledOnce();
      });
    });

    it("should fail when the post id is valid but no user is followed", async () => {
      vi.mocked(populateDB).mockImplementationOnce(
        bulkAddUsersAndPostsToDBNoFollowers,
      );
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(prismaFindManyUserSpy).not.toHaveBeenCalledOnce();
      expect(prismaFindManyPostSpy).not.toHaveBeenCalledOnce();
    });

    // It could be an error from another prisma call too. Just checking for unexpected errors.
    it("should fail when there is a database error", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      prismaFindManyUserSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
