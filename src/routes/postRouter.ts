// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { createPostValidators } from "#src/validators/post/createPostValidator";
import { createPost } from "#src/controllers/post/createPost";
import { isLogged } from "#src/middlewares/isLogged";
import { fieldValidation } from "#src/middlewares/fieldValidation";
import { deletePost } from "#src/controllers/post/deletePost";

const postRouter = Router();

postRouter.use(isLogged);
postRouter.post("/create", createPostValidators, fieldValidation, createPost);
postRouter.delete("/delete/:postId", deletePost);

export { postRouter };
