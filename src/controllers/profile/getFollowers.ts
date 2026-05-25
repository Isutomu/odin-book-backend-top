// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";

// CONTROLLER
/**
 * Get the first 10 (or less, if they have less) followers of logged user.
 */
export const getFollowers = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  const followersAmmount = await prisma.user.count({
    where: { following: { some: { id: userId } } },
  });
  const followers = await prisma.user.findMany({
    where: { following: { some: { id: userId } } },
    select: { username: true },
    orderBy: { username: "asc" },
    take: 10,
  });
  return res
    .status(200)
    .json({ message: "success", data: { followersAmmount, followers } });
};
