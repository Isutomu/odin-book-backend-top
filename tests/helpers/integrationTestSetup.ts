// 3rd Party Modules
import bcrypt from "bcryptjs";

// Local Modules
import { userSignup } from "./data.js";
import { prisma } from "#src/lib/prisma";

export const createUser = async () => {
  const { username, email, password } = userSignup;
  const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(password, salt);
  await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });
};
