// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { authRouter } from "#src/routes/authRouter";

const router = Router();

router.use("/auth", authRouter);

export { router };
