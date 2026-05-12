// 3rd Party Modules
import { Router } from "express";

// Local Modules
import { createPostValidators } from "#src/validators/post/createPostValidator";
import { createPost } from "#src/controllers/post/createPost";
import { isLogged } from "#src/middlewares/isLogged";
import { fieldValidation } from "#src/middlewares/fieldValidation";
import { deletePost } from "#src/controllers/post/deletePost";
import { updatePost } from "#src/controllers/post/updatePost";
import { updatePostValidators } from "#src/validators/post/updatePostValidator";

const postRouter = Router();

postRouter.use(isLogged);
postRouter.post("/create", createPostValidators, fieldValidation, createPost);
postRouter.delete("/delete/:postId", deletePost);
postRouter.patch(
  "/update/:postId",
  updatePostValidators,
  fieldValidation,
  updatePost,
);

export { postRouter };
