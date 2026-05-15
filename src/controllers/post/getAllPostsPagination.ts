// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";
import { CustomError } from "#src/lib/CustomError";
import type { CustomNextFunction } from "#src/types/types";

// Controller Helpers
const isUsernameValid = async (username: string) => {
  try {
    await prisma.user.findFirstOrThrow({ where: { username } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return false;
    }
    throw e;
  }
  return true;
};

const isLastPostIdValid = async (lastPostId: string) => {
  try {
    await prisma.post.findFirstOrThrow({
      where: {
        id: lastPostId,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return false;
    }
    throw e;
  }
  return true;
};

// CONTROLLER
export const getAllPostsPagination = async (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  const username = req.params.username as string;
  const lastPostId = req.params.lastPostId as string;
  if (!(await isUsernameValid(username))) {
    return next(new CustomError(404, "User not found"));
  }
  if (!(await isLastPostIdValid(lastPostId))) {
    return next(new CustomError(404, "Post not found"));
  }

  const posts = await prisma.post.findMany({
    take: 10,
    where: { author: { username } },
    include: { author: { select: { username: true } } },
    orderBy: { publishedAt: "desc" },
    omit: { authorId: true },
    skip: 1,
    cursor: { id: lastPostId },
  });
  return res.status(200).json({ message: "success", data: posts });
};
