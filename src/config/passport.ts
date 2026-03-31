// 3rd Party Modules
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

// Local Modules
import { prisma } from "#src/lib/prisma";
import { CustomError } from "#src/lib/CustomError";

const authStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      const error = new CustomError(401, "Username not found");
      return done(error, false);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new CustomError(401, "Incorrect password");
      return done(error, false);
    }

    return done(null, user);
  } catch {
    const error = new CustomError();
    return done(error);
  }
});

passport.use(authStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findFirst({ where: { id } });
    done(null, user);
  } catch {
    const error = new CustomError();
    return done(error);
  }
});

export { passport };
