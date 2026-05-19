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
import { getFeed } from "#src/controllers/post/getFeed";
import { getFeedPagination } from "#src/controllers/post/getFeedPagination";
import { getPost } from "#src/controllers/post/getPost";
import { getAllPosts } from "#src/controllers/post/getAllPosts";
import { getAllPostsPagination } from "#src/controllers/post/getAllPostsPagination";

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
postRouter.get("/feed", getFeed);
postRouter.get("/feed/pagination/:lastPostId", getFeedPagination);
postRouter.get("/read/:postId", getPost);
postRouter.get("/read-all/:username", getAllPosts);
postRouter.get(
  "/read-all/:username/pagination/:lastPostId",
  getAllPostsPagination,
);

export { postRouter };
