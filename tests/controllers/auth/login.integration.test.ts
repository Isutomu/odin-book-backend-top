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
import {
  userLogin,
  type UserLogin,
  type UserSignup,
} from "#tests/helpers/data";
import { errorHandler } from "#src/middlewares/errorHandler";
import { loginValidators } from "#src/validators/auth/loginValidator";
import { login } from "#src/controllers/auth/login";
import { createUser } from "#tests/helpers/integrationTestSetup";

// Constants
const PATH = "/auth/login";

app.post(PATH, loginValidators, fieldValidation, login);
app.use(errorHandler);
const prismaUserFindFirstSpy = vi.spyOn(prisma.user, "findFirst");

describe("Login User Integration Tests", () => {
  beforeAll(async () => {
    await cleanDatabase();
    await createUser();
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterAll(async () => {
    await cleanDatabase();
  });

  describe("Successful Cases", () => {
    it("should login an user successfully", async () => {
      const response = await supertest(app).post(PATH).send(userLogin);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.header).toHaveProperty("set-cookie");
      expect(prismaUserFindFirstSpy).toHaveBeenCalledExactlyOnceWith({
        where: { username: userLogin.username },
      });
    });
  });

  describe("Failure Cases", () => {
    describe("Invalid fields", () => {
      it("should fail when no payload is provided", async () => {
        const response = await supertest(app).post(PATH).send({});
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUserFindFirstSpy).not.toHaveBeenCalled();
      });

      it("should fail when no username is provided", async () => {
        type UserWithoutUsername = Omit<UserLogin, "username"> &
          Partial<Pick<UserSignup, "username">>;
        const userWithoutUsername: UserWithoutUsername = { ...userLogin };
        delete userWithoutUsername.username;
        const response = await supertest(app)
          .post(PATH)
          .send(userWithoutUsername);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUserFindFirstSpy).not.toHaveBeenCalled();
      });

      it("should fail when no password is provided", async () => {
        type UserWithoutPassword = Omit<UserLogin, "password"> &
          Partial<Pick<UserSignup, "password">>;
        const userWithoutPassword: UserWithoutPassword = { ...userLogin };
        delete userWithoutPassword.password;
        const response = await supertest(app)
          .post(PATH)
          .send(userWithoutPassword);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(prismaUserFindFirstSpy).not.toHaveBeenCalled();
      });
    });

    it("should fail upon unregistered username", async () => {
      const unregisteredUsername = "unregisteredUsername";
      const response = await supertest(app)
        .post(PATH)
        .send({ ...userLogin, username: unregisteredUsername });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.header).not.toHaveProperty("set-cookie");
      expect(prismaUserFindFirstSpy).toHaveBeenCalledExactlyOnceWith({
        where: { username: unregisteredUsername },
      });
    });

    it("should fail upon wrong password", async () => {
      const wrongPassword = "wrongPassword";
      const response = await supertest(app)
        .post(PATH)
        .send({ ...userLogin, password: wrongPassword });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.header).not.toHaveProperty("set-cookie");
      expect(prismaUserFindFirstSpy).toHaveBeenCalledExactlyOnceWith({
        where: { username: userLogin.username },
      });
    });

    // It could be an error from bcryptjs too. Just checking for unexpected errors.
    it("should fail when there is a database error", async () => {
      prismaUserFindFirstSpy.mockRejectedValueOnce(new Error("Database error"));
      const response = await supertest(app).post(PATH).send(userLogin);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });
});
