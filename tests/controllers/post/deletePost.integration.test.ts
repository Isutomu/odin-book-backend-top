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
import { deletePost } from "#src/controllers/post/deletePost";

// Constants
const PATH = "/post/delete/:postId";
const PATH_SUPERTEST = "/post/delete/postId";
const PATH_SUPERTEST_WRONG_ID = "/post/delete/WRONGID";

app.use(addUserToRequest);
app.use(addPostToDB);
app.delete(PATH, deletePost);
app.use(errorHandler);
const prismaDeletePostSpy = vi.spyOn(prisma.post, "delete");

describe("Delete Post Integration Tests", () => {
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
    it("should delete a post successfully", async () => {
      const response = await supertest(app).delete(PATH_SUPERTEST);
      expect(response.status).toBe(204);
      expect(prismaDeletePostSpy).toHaveBeenCalledExactlyOnceWith({
        where: { id: "postId" },
      });
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when there is no post with the provided id", async () => {
        const response = await supertest(app).delete(PATH_SUPERTEST_WRONG_ID);
        expect(response.status).toBe(404);
        expect(prismaDeletePostSpy).toHaveBeenCalledExactlyOnceWith({
          where: { id: "WRONGID" },
        });
      });
    });

    it("should not delete a post when there is a database error", async () => {
      prismaDeletePostSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).delete(PATH_SUPERTEST);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
