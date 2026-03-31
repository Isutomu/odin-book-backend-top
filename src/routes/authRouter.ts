// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { signupValidators } from "#src/validators/auth/signupValidator";
import { signup } from "#src/controllers/auth/signup";
import { loginValidators } from "#src/validators/auth/loginValidator";
import { login } from "#src/controllers/auth/login";
import { fieldValidation } from "#src/middlewares/fieldValidation";
import { verifySession } from "#src/controllers/auth/verifySession";

const authRouter = Router();

authRouter.get("/verify-session", verifySession);
authRouter.post("/signup", signupValidators, fieldValidation, signup);
authRouter.post("/login", loginValidators, fieldValidation, login);

export { authRouter };
