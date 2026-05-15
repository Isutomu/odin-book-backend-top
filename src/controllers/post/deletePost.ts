// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";
import { Prisma } from "#src/generated/prisma/client";
import type { CustomNextFunction } from "#src/types/types";
import { CustomError } from "#src/lib/CustomError";

// CONTROLLER
export const deletePost = async (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  const postId = req.params.postId;
  if (typeof postId !== "string") {
    return res.status(400).json();
  }

  try {
    await prisma.post.delete({ where: { id: postId } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return next(new CustomError(404, "Post not found"));
    }
    throw e;
  }

  return res.status(204).json();
};
