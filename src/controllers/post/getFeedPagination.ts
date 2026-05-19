// 3rd Party Modules
import { type Request, type Response } from "express";

// Local Modules
import { prisma } from "#src/lib/prisma";
import {
  type Prisma,
  Prisma as PrismaClass,
} from "#src/generated/prisma/client";
import { CustomError } from "#src/lib/CustomError";
import type { CustomNextFunction } from "#src/types/types";

// Controller Helpers
const isLastPostIdValid = async (lastPostId: string, userId: string) => {
  try {
    await prisma.post.findFirstOrThrow({
      where: {
        id: lastPostId,
        author: { followers: { some: { id: userId } } },
      },
    });
  } catch (e) {
    if (
      e instanceof PrismaClass.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return false;
    }
    throw e;
  }
  return true;
};

const getFollowedUsers = async (authorId: string) => {
  const followedUsers = await prisma.user.findMany({
    where: { followers: { some: { id: { equals: authorId } } } },
    select: { id: true },
  });
  return followedUsers;
};

const getFollowedUsersId = (followedUsers: { id: string }[]) => {
  return followedUsers.reduce(
    (accum: string[], user: { id: string }) => [...accum, user.id],
    [],
  );
};

const getPosts = async (followedUsersId: string[], lastPostId: string) => {
  const query: Prisma.PostFindManyArgs = {
    take: 10,
    where: { author: { id: { in: followedUsersId } } },
    include: { author: { select: { username: true } } },
    orderBy: { publishedAt: "desc" },
    omit: { authorId: true },
    skip: 1,
    cursor: {
      id: lastPostId,
    },
  };

  const posts = await prisma.post.findMany(query);
  return posts;
};

// CONTROLLER
export const getFeedPagination = async (
  req: Request,
  res: Response,
  next: CustomNextFunction,
) => {
  const userId = req.user?.id as string;
  const lastPostId = req.params.lastPostId as string;
  if (!(await isLastPostIdValid(lastPostId, userId))) {
    return next(new CustomError(404, "Post not found"));
  }

  const followedUsers = await getFollowedUsers(userId);
  if (followedUsers.length === 0) {
    return res.status(200).json({ message: "success", data: [] });
  }
  const followedUsersId = getFollowedUsersId(followedUsers);
  const posts = await getPosts(followedUsersId, lastPostId);

  if (posts.length === 0) {
    return res.status(200).json({ message: "success", data: [] });
  }
  return res.status(200).json({ message: "success", data: posts });
};
