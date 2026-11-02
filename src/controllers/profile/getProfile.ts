// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";

// CONTROLLER
/**
 * Get the user profile information (at this point, description, and picture).
 */
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  const profile = await prisma.profile.findFirstOrThrow({
    where: { authorId: userId },
    select: { description: true, picture: true },
  });
  return res.status(200).json({ message: "success", data: { profile } });
};
