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
import { postCreate } from "#tests/helpers/data";
import { errorHandler } from "#src/middlewares/errorHandler";
import { createPostValidators } from "#src/validators/post/createPostValidator";
import { createPost } from "#src/controllers/post/createPost";
import { addUserToRequest } from "#tests/helpers/integrationTestSetup";

// Constants
const PATH = "/post/create";

app.use(addUserToRequest);
app.post(PATH, createPostValidators, fieldValidation, createPost);
app.use(errorHandler);
const prismaCreatePostSpy = vi.spyOn(prisma.post, "create");

describe("Create Post Integration Tests", () => {
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
    it("should create a post successfully", async () => {
      const response = await supertest(app).post(PATH).send(postCreate);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(prismaCreatePostSpy).toHaveBeenCalledExactlyOnceWith({
        data: expect.objectContaining({
          content: postCreate.content,
        }),
      });
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when no payload is provided", async () => {
        const response = await supertest(app).post(PATH).send({});
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaCreatePostSpy).not.toHaveBeenCalled();
      });
    });

    // It could be an error from bcryptjs too. Just checking for unexpected errors.
    it("should not create an user when there is a database error", async () => {
      prismaCreatePostSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).post(PATH).send(postCreate);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
