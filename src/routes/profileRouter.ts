// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { isLogged } from "#src/middlewares/isLogged";
import { getFollowers } from "#src/controllers/profile/getFollowers";
import { getFollowing } from "#src/controllers/profile/getFollowing";

const profileRouter = Router();

profileRouter.use(isLogged);

profileRouter.get("/followers", getFollowers);
profileRouter.get("/following", getFollowing);

export { profileRouter };
