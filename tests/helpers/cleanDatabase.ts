// Local Modules
import { prisma } from "#src/lib/prisma";

export const cleanDatabase = async () => {
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteUsers]);
};
