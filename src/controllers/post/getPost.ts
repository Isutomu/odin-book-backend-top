// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";
import { CustomError } from "#src/lib/CustomError";
import type { CustomNextFunction } from "#src/types/types";

// CONTROLLER
export const getPost = async (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  const postId = req.params.postId as string;

  try {
    const post = await prisma.post.findFirstOrThrow({ where: { id: postId } });
    return res.status(200).json({ message: "success", data: post });
  } catch (e) {
    return next(new CustomError(404, "Post not found"));
  }
};
