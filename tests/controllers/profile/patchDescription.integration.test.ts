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
import { descriptionPatch } from "#tests/helpers/data";
import { errorHandler } from "#src/middlewares/errorHandler";
import { addUserToRequest } from "#tests/helpers/integrationTestSetup";
import { patchDescription } from "#src/controllers/profile/patchDescription";
import { patchDescriptionValidators } from "#src/validators/profile/patchDescriptionValidator";

// Constants
const PATH = "/profile/patchDescription";

app.use(addUserToRequest);
app.patch(PATH, patchDescriptionValidators, fieldValidation, patchDescription);
app.use(errorHandler);
const prismaUpdateProfileSpy = vi.spyOn(prisma.profile, "update");

describe("Patch Profile Description Integration Tests", () => {
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
    it("should patch a profile description successfully", async () => {
      const response = await supertest(app).patch(PATH).send(descriptionPatch);
      expect(response.status).toBe(204);
      expect(prismaUpdateProfileSpy).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          data: {
            description: descriptionPatch.description,
          },
        }),
      );
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when no payload is provided", async () => {
        const response = await supertest(app).patch(PATH).send({});
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUpdateProfileSpy).not.toHaveBeenCalled();
      });
    });

    // It could be an error from bcryptjs too. Just checking for unexpected errors.
    it("should not create an user when there is a database error", async () => {
      prismaUpdateProfileSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).patch(PATH).send(descriptionPatch);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
