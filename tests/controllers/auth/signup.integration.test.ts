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
import { signup } from "#src/controllers/auth/signup";
import { prisma } from "#src/lib/prisma";
import { signupValidators } from "#src/validators/auth/signupValidator";
import { fieldValidation } from "#src/middlewares/fieldValidation";
import { cleanDatabase } from "#tests/helpers/cleanDatabase";
import {
  newUserSignup,
  userSignup,
  type UserSignup,
} from "#tests/helpers/data";
import { errorHandler } from "#src/middlewares/errorHandler";

// Constants
const PATH = "/auth/signup";

app.post(PATH, signupValidators, fieldValidation, signup);
app.use(errorHandler);
const prismaUserCreateSpy = vi.spyOn(prisma.user, "create");

describe("Signup User Integration Tests", () => {
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
    it("should create an user successfully", async () => {
      const response = await supertest(app).post(PATH).send(userSignup);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(prismaUserCreateSpy).toHaveBeenCalledExactlyOnceWith({
        data: expect.objectContaining({
          username: userSignup.username,
        }),
      });
    });
  });

  describe("Failure Cases", () => {
    it("should fail when the username is already being used", async () => {
      await prisma.user.create({
        data: { ...newUserSignup, email: "email1@email.com" },
      });
      const response = await supertest(app)
        .post(PATH)
        .send({ ...newUserSignup, email: "email2@email.com" });
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("message");
    });

    it("should fail when the email is already being used", async () => {
      await prisma.user.create({
        data: { ...newUserSignup, username: "username1" },
      });
      const response = await supertest(app)
        .post(PATH)
        .send({ ...newUserSignup, username: "username2" });
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("message");
    });

    describe("Invalid fields", () => {
      it("should fail when no payload is provided", async () => {
        const response = await supertest(app).post(PATH).send({});
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUserCreateSpy).not.toHaveBeenCalled();
      });

      it("should fail when no username is provided", async () => {
        type UserWithoutUsername = Omit<UserSignup, "username"> &
          Partial<Pick<UserSignup, "username">>;
        const userWithoutUsername: UserWithoutUsername = { ...userSignup };
        delete userWithoutUsername.username;
        const response = await supertest(app)
          .post(PATH)
          .send(userWithoutUsername);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUserCreateSpy).not.toHaveBeenCalled();
      });

      it("should fail when no password is provided", async () => {
        type UserWithoutPassword = Omit<UserSignup, "password"> &
          Partial<Pick<UserSignup, "password">>;
        const userWithoutPassword: UserWithoutPassword = { ...userSignup };
        delete userWithoutPassword.password;
        const response = await supertest(app)
          .post(PATH)
          .send(userWithoutPassword);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUserCreateSpy).not.toHaveBeenCalled();
      });
    });

    // It could be an error from bcryptjs too. Just checking for unexpected errors.
    it("should not create an user when there is a database error", async () => {
      prismaUserCreateSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).post(PATH).send(newUserSignup);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
