// 3rd Party Modules
import express from "express";
import helmet from "helmet";
import logger from "morgan";
import cors from "cors";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

// Local Modules
import { router } from "#src/routes/index";
import { errorHandler } from "#src/middlewares/errorHandler";
import { prisma } from "#src/lib/prisma";
import { passport } from "#src/config/passport";

// Server Initialization
const PORT = parseInt(process.env.PORT || "3000", 10);
const app = express();

// Middlewares
app.use(helmet());
app.use(logger("tiny"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(
  expressSession({
    proxy: true,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.COOKIE_SECURE,
      sameSite: process.env.COOKIE_SAME_SITE,
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 1000 * 60 * 10,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

// Passport Authentication
app.use(passport.session());

// Routes
app.use(
  "/",
  cors({
    origin: process.env.APP_BASE_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
  router,
);

// Error Middleware
app.use(errorHandler);

// Server Listening
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(
    `Server is Successfully Running, and App is listening on port ${PORT}`,
  );
});
