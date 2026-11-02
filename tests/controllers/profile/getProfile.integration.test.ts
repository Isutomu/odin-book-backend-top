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
import { getProfile } from "#src/controllers/profile/getProfile";

// Constants
const PATH = "/profile/profile";
const RESPONSE_DATA_FORMAT = {
  profile: {
    description: null,
    picture: null,
  },
};

// Mocks
const populateDB = vi.fn((_req: Request, _res: Response, next: NextFunction) =>
  next(),
);

app.use(addUserToRequest);
app.use(populateDB);
app.get(PATH, getProfile);
app.use(errorHandler);
const prismaFindFirstOrThrowProfileSpy = vi.spyOn(
  prisma.profile,
  "findFirstOrThrow",
);

describe("Get Profile Of Logged User", () => {
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
    it("should get profile successfully", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.data).toMatchObject(RESPONSE_DATA_FORMAT);
      expect(prismaFindFirstOrThrowProfileSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Failure Cases", () => {
    // It could be an error from another prisma call too. Just checking for unexpected errors.
    it("should fail when there is a database error", async () => {
      vi.mocked(populateDB).mockImplementationOnce(bulkAddUsersAndPostsToDB);
      prismaFindFirstOrThrowProfileSpy.mockRejectedValueOnce(
        new Error("Database error"),
      );
      const response = await supertest(app).get(PATH);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
