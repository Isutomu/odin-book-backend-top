// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { sanitizeHTML } from "#src/utils/sanitizeHTML";
import { prisma } from "#src/lib/prisma";
import type { CustomNextFunction } from "#src/types/types";
import { Prisma } from "#src/generated/prisma/client";
import { CustomError } from "#src/lib/CustomError";

// CONTROLLER
export const updatePost = async (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  const { content } = req.body;
  const postId = req.params.postId;
  if (typeof postId !== "string") {
    return res.status(400).json();
  }

  const sanitizedPost = sanitizeHTML(content);
  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        content: sanitizedPost,
      },
    });
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
