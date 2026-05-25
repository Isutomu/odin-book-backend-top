// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { authRouter } from "#src/routes/authRouter";
import { postRouter } from "#src/routes/postRouter";
import { profileRouter } from "./profileRouter.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/post", postRouter);
router.use("/profile", profileRouter);

export { router };
