// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { sanitizeHTML } from "#src/utils/sanitizeHTML";
import { prisma } from "#src/lib/prisma";

// CONTROLLER
export const patchDescription = async (req: Request, res: Response) => {
  const { description } = req.body;
  const authorId = req.user?.id;

  const sanitizedDescription = sanitizeHTML(description);
  await prisma.profile.update({
    // @ts-ignore
    where: { authorId },
    data: {
      description: sanitizedDescription,
    },
  });
  return res.status(204).json();
};
