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

// Local Modules
import { app } from "#tests/helpers/appSetup";
import { prisma } from "#src/lib/prisma";
import { cleanDatabase } from "#tests/helpers/cleanDatabase";
import { errorHandler } from "#src/middlewares/errorHandler";
import {
  addPostToDB,
  addUserToRequest,
} from "#tests/helpers/integrationTestSetup";
import { getPost } from "#src/controllers/post/getPost";

// Constants
const PATH = "/post/read/:postId";
const PATH_SUPERTEST = "/post/read/postId";
const PATH_SUPERTEST_WRONG_ID = "/post/read/WRONGID";

app.use(addUserToRequest);
app.use(addPostToDB);
app.get(PATH, getPost);
app.use(errorHandler);
const prismaFindFirstOrThrowPostSpy = vi.spyOn(prisma.post, "findFirstOrThrow");

describe("Get Post Integration Tests", () => {
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
    it("should get a post successfully", async () => {
      const response = await supertest(app).get(PATH_SUPERTEST);
      expect(response.status).toBe(200);
      expect(prismaFindFirstOrThrowPostSpy).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          where: { id: "postId" },
        }),
      );
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when there is no post with the provided id", async () => {
        const response = await supertest(app).get(PATH_SUPERTEST_WRONG_ID);
        expect(response.status).toBe(404);
        expect(prismaFindFirstOrThrowPostSpy).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            where: { id: "WRONGID" },
          }),
        );
      });
    });
  });
});
