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
  addPostToDB,
  addUserToRequest,
} from "#tests/helpers/integrationTestSetup";
import { getAllPosts } from "#src/controllers/post/getAllPosts";
import { postsResponseDataFormat } from "#tests/helpers/data";

// Constants
const PATH = "/post/read-all/:username";
const PATH_SUPERTEST = "/post/read-all/username";
const PATH_SUPERTEST_WRONG_USERNAME = "/post/read-all/WRONG-USERNAME";

// Mocks
const populateDB = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
  next(),
);

app.use(addUserToRequest);
app.use(populateDB);
app.get(PATH, getAllPosts);
app.use(errorHandler);
const prismaFindFirstOrThrowUserSpy = vi.spyOn(prisma.user, "findFirstOrThrow");
const prismaFindManyPostSpy = vi.spyOn(prisma.post, "findMany");

describe("Get All Posts Integration Tests", () => {
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
    it("should get all posts from an user successfully", async () => {
      vi.mocked(populateDB).mockImplementationOnce(addPostToDB);
      const response = await supertest(app).get(PATH_SUPERTEST);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining(postsResponseDataFormat),
        ]),
      );
      expect(prismaFindFirstOrThrowUserSpy).toHaveBeenCalledExactlyOnceWith({
        where: { username: "username" },
      });
      expect(prismaFindManyPostSpy).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          where: { author: { username: "username" } },
        }),
      );
    });

    it("should return an empty data array if no user is followed", async () => {
      const response = await supertest(app).get(PATH_SUPERTEST);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toEqual([]);
      expect(prismaFindFirstOrThrowUserSpy).toHaveBeenCalledOnce();
      expect(prismaFindManyPostSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when the username is invalid", async () => {
        const response = await supertest(app).get(
          PATH_SUPERTEST_WRONG_USERNAME,
        );
        expect(response.status).toBe(404);
        expect(prismaFindFirstOrThrowUserSpy).toHaveBeenCalledExactlyOnceWith({
          where: { username: "WRONG-USERNAME" },
        });
      });
    });
  });
});
