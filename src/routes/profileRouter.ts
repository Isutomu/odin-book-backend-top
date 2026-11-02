// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { isLogged } from "#src/middlewares/isLogged";
import { getFollowers } from "#src/controllers/profile/getFollowers";
import { getFollowing } from "#src/controllers/profile/getFollowing";
import { getProfile } from "#src/controllers/profile/getProfile";
import { patchDescription } from "#src/controllers/profile/patchDescription";
import { patchDescriptionValidators } from "#src/validators/profile/patchDescriptionValidator";
import { fieldValidation } from "#src/middlewares/fieldValidation";

const profileRouter = Router();

profileRouter.use(isLogged);

profileRouter.get("/followers", getFollowers);
profileRouter.get("/following", getFollowing);
profileRouter.get("/profile", getProfile);
profileRouter.patch(
  "/patchDescription",
  patchDescriptionValidators,
  fieldValidation,
  patchDescription,
);

export { profileRouter };
