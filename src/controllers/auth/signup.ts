// 3rd Party Modules
import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";

// Local Modules
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";
import { type CustomNextFunction } from "#src/types/types";
import { CustomError } from "#src/lib/CustomError";

// CONTROLLER
export const signup = async (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  const { username, email, password } = req.body;
  const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return next(
        new CustomError(409, "Username and/or Email already registered"),
      );
    }
    throw e;
  }

  return res.status(201).json({ message: "success" });
};
