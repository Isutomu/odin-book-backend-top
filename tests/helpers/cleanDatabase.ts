// Local Modules
import { prisma } from "#src/lib/prisma";

export const cleanDatabase = async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteProfile = prisma.profile.deleteMany();
  const deleteVisualCustomization = prisma.visualCustomization.deleteMany();
  const deletePost = prisma.post.deleteMany();
  const deleteComment = prisma.comment.deleteMany();

  await prisma.$transaction([
    deleteComment,
    deletePost,
    deleteVisualCustomization,
    deleteProfile,
    deleteUsers,
  ]);
};
