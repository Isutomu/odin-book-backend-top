// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";

// CONTROLLER
/**
 * Get the first 10 (or less, if they have less) followed users of logged user.
 */
export const getFollowing = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  const followingAmmount = await prisma.user.count({
    where: { followers: { some: { id: userId } } },
  });
  const following = await prisma.user.findMany({
    where: { followers: { some: { id: userId } } },
    select: { username: true },
    orderBy: { username: "asc" },
    take: 10,
  });
  return res
    .status(200)
    .json({ message: "success", data: { followingAmmount, following } });
};
