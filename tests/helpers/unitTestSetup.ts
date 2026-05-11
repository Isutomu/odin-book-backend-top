// 3rd Party Modules
import { type Request, type Response } from "express";
import { vi } from "vitest";

// Local Modules
import { type CustomNextFunction } from "#src/types/types";
import {
  postCreate,
  userLogin,
  userSignup,
  type PostCreate,
  type UserLogin,
  type UserSignup,
} from "#tests/helpers/data";

type RequestUserSignup = { body: UserSignup } & Partial<Omit<Request, "body">>;
export const reqAuthSignup: RequestUserSignup = {
  body: userSignup,
};

type RequestUserLogin = { body: UserLogin } & Partial<Omit<Request, "body">>;
export const reqAuthLogin: RequestUserLogin = {
  body: userLogin,
};

type RequestUserIsLogged = { user: { id: string } } & Partial<
  Omit<Request, "user">
>;
export const reqIsLogged: RequestUserIsLogged = {
  user: { id: "1234" },
};

export const res: Partial<Response> = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
};

export const next: Partial<CustomNextFunction> = vi.fn().mockReturnThis();

type RequestCreatePost = { body: PostCreate } & Partial<Omit<Request, "body">>;
export const reqCreatePost: RequestCreatePost = {
  body: postCreate,
};
