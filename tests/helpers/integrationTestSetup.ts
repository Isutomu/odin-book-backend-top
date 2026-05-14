// 3rd Party Modules
import bcrypt from "bcryptjs";
import { type NextFunction, type Request, type Response } from "express";
import { faker } from "@faker-js/faker";

// Local Modules
import { userSignup } from "./data.js";
import { prisma } from "#src/lib/prisma";

// Helper Functions
export const createUser = async () => {
  const { username, email, password } = userSignup;
  const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(password, salt);
  const createdUser = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  return createdUser;
};

// Middlewares
export const addUserToRequest = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const createdUser = await createUser();
  req.user = { id: createdUser.id, username: createdUser.username };
  return next();
};

export const addPostToDB = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.user?.id === undefined) {
    throw new Error("Incorrect chain of middleware for testing");
  }

  await prisma.post.create({
    data: {
      id: "postId",
      content: "",
      author: {
        connect: {
          id: req.user?.id,
        },
      },
    },
  });
  return next();
};

/**
 * Create 11 users and have the logged user (other middleware) follow all of them.
 * Create 1 post for each of the newly created users.
 */
export const bulkAddUsersAndPostsToDB = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  for (let i = 1; i <= 11; i++) {
    faker.seed(i);
    const username = faker.person.firstName();
    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@email.com`,
        password: "password",
        followers: { connect: { username: userSignup.username } },
      },
    });
    await prisma.post.create({
      data: {
        id: `post${i}`,
        content: faker.book.title(),
        author: { connect: { id: user.id } },
      },
    });
  }
  next();
};

/**
 * Create 11 users and have the logged user (other middleware) follow all of them.
 */
export const bulkAddUsers = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  for (let i = 1; i <= 11; i++) {
    faker.seed(i);
    const username = faker.person.firstName();
    await prisma.user.create({
      data: {
        username,
        email: `${username}@email.com`,
        password: "password",
        followers: { connect: { username: userSignup.username } },
      },
    });
  }
  return next();
};

/**
 * Create 11 users.
 * Create 1 post for each of the newly created users.
 */
export const bulkAddUsersAndPostsToDBNoFollowers = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  for (let i = 1; i <= 11; i++) {
    faker.seed(i);
    const username = faker.person.firstName();
    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@email.com`,
        password: "password",
      },
    });
    await prisma.post.create({
      data: {
        id: `post${i}`,
        content: faker.book.title(),
        author: { connect: { id: user.id } },
      },
    });
  }
  next();
};
