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
  bulkAddPostsToUser,
} from "#tests/helpers/integrationTestSetup";
import { postsResponseDataFormat } from "#tests/helpers/data";
import { getAllPostsPagination } from "#src/controllers/post/getAllPostsPagination";

// Constants
const PATH = "/post/read-all/:username/pagination/:lastPostId";
const PATH_SUPERTEST = "/post/read-all/username/pagination/post10";
const PATH_SUPERTEST_WRONG_USERNAME =
  "/post/read-all/WRONG-USERNAME/pagination/post10";
const PATH_SUPERTEST_WRONG_POST_ID =
  "/post/read-all/username/pagination/WRONG-POST-ID";

// Mocks
const populateDB = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
  next(),
);

app.use(addUserToRequest);
app.use(populateDB);
app.get(PATH, getAllPostsPagination);
app.use(errorHandler);
const prismaFindFirstOrThrowUserSpy = vi.spyOn(prisma.user, "findFirstOrThrow");
const prismaFindFirstOrThrowPostSpy = vi.spyOn(prisma.post, "findFirstOrThrow");
const prismaFindManyPostSpy = vi.spyOn(prisma.post, "findMany");

describe("Get All Posts Pagination Integration Tests", () => {
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
    it("should get user's posts successfully", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddPostsToUser);
      const response = await supertest(app).get(PATH_SUPERTEST);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining(postsResponseDataFormat),
        ]),
      );
      expect(prismaFindFirstOrThrowUserSpy).toHaveBeenCalledOnce();
      expect(prismaFindFirstOrThrowPostSpy).toHaveBeenCalledOnce();
      expect(prismaFindManyPostSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when the username is invalid", async () => {
        vi.mocked(populateDB).mockImplementationOnce(bulkAddPostsToUser);
        const response = await supertest(app).get(
          PATH_SUPERTEST_WRONG_USERNAME,
        );
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(prismaFindFirstOrThrowUserSpy).toHaveBeenCalledOnce();
        expect(prismaFindFirstOrThrowPostSpy).not.toHaveBeenCalledOnce();
        expect(prismaFindManyPostSpy).not.toHaveBeenCalledOnce();
      });

      it("should fail when the post id is invalid", async () => {
        vi.mocked(populateDB).mockImplementationOnce(bulkAddPostsToUser);
        const response = await supertest(app).get(PATH_SUPERTEST_WRONG_POST_ID);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(prismaFindFirstOrThrowUserSpy).toHaveBeenCalledOnce();
        expect(prismaFindFirstOrThrowPostSpy).toHaveBeenCalledOnce();
        expect(prismaFindManyPostSpy).not.toHaveBeenCalledOnce();
      });
    });

    // It could be an error from another prisma call too. Just checking for unexpected errors.
    it("should fail when there is a database error", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddPostsToUser);
      prismaFindFirstOrThrowUserSpy.mockRejectedValueOnce(
        new Error("Database error"),
      );
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
