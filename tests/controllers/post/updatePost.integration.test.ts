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
import { fieldValidation } from "#src/middlewares/fieldValidation";
import { cleanDatabase } from "#tests/helpers/cleanDatabase";
import { postUpdate } from "#tests/helpers/data";
import { errorHandler } from "#src/middlewares/errorHandler";
import {
  addPostToDB,
  addUserToRequest,
} from "#tests/helpers/integrationTestSetup";
import { updatePostValidators } from "#src/validators/post/updatePostValidator";
import { updatePost } from "#src/controllers/post/updatePost";

// Constants
const PATH = "/post/update/:postId";
const PATH_SUPERTEST = "/post/update/postId";
const PATH_SUPERTEST_WRONG_ID = "/post/update/WRONGID";

app.use(addUserToRequest);
app.use(addPostToDB);
app.patch(PATH, updatePostValidators, fieldValidation, updatePost);
app.use(errorHandler);
const prismaUpdatePostSpy = vi.spyOn(prisma.post, "update");

describe("Update Post Integration Tests", () => {
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
    it("should update a post successfully", async () => {
      const response = await supertest(app)
        .patch(PATH_SUPERTEST)
        .send(postUpdate);
      expect(response.status).toBe(204);
      expect(prismaUpdatePostSpy).toHaveBeenCalledExactlyOnceWith({
        where: { id: "postId" },
        data: expect.objectContaining({
          content: postUpdate.content,
        }),
      });
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when no payload is provided", async () => {
        const response = await supertest(app).patch(PATH_SUPERTEST).send({});
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUpdatePostSpy).not.toHaveBeenCalled();
      });

      it("should fail when there is no post with the provided id", async () => {
        const response = await supertest(app)
          .patch(PATH_SUPERTEST_WRONG_ID)
          .send(postUpdate);
        expect(response.status).toBe(404);
        expect(prismaUpdatePostSpy).toHaveBeenCalledExactlyOnceWith({
          where: { id: "WRONGID" },
          data: expect.objectContaining({
            content: postUpdate.content,
          }),
        });
      });
    });

    it("should not update a post when there is a database error", async () => {
      prismaUpdatePostSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app)
        .patch(PATH_SUPERTEST)
        .send(postUpdate);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
