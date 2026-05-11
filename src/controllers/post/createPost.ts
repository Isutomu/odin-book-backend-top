// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { sanitizeHTML } from "#src/utils/sanitizeHTML";
import { prisma } from "#src/lib/prisma";

// CONTROLLER
export const createPost = async (req: Request, res: Response) => {
  const { content } = req.body;
  const authorId = req.user?.id;

  const sanitizedPost = sanitizeHTML(content);
  try {
    await prisma.post.create({
      data: {
        content: sanitizedPost,
        author: {
          // @ts-ignore
          connect: { id: authorId },
        },
      },
    });
  } catch (e) {
    throw e;
  }

  return res.status(201).json({ message: "success" });
};
