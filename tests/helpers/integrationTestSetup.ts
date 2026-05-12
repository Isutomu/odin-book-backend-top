// 3rd Party Modules
import bcrypt from "bcryptjs";
import { type NextFunction, type Request, type Response } from "express";

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
