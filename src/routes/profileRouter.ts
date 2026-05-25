// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { isLogged } from "#src/middlewares/isLogged";
import { getFollowers } from "#src/controllers/profile/getFollowers";

const profileRouter = Router();

profileRouter.use(isLogged);

profileRouter.get("/followers", getFollowers);

export { profileRouter };
