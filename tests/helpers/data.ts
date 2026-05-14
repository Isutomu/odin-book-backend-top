// 3rd Party Modules
import { type Post, type User } from "#src/generated/prisma/client";
import { expect } from "vitest";

export type UserSignup = Omit<User, "id">;
export const userSignup: UserSignup = {
  username: "username",
  email: "email@email.com",
  password: "password",
};
export const newUserSignup: UserSignup = {
  username: "usernameUsername",
  email: "email@email.com",
  password: "passwordPassword",
};

export type UserLogin = Omit<User, "id" | "email">;
export const userLogin: UserLogin = {
  username: "username",
  password: "password",
};

export type PostCreate = Omit<
  Post,
  "id" | "publishedAt" | "updatedAt" | "authorId"
>;
export const postCreate: PostCreate = {
  content: "content",
};

export type PostUpdate = Omit<
  Post,
  "id" | "publishedAt" | "updatedAt" | "authorId"
>;
export const postUpdate: PostCreate = {
  content: "new content!",
};

export const postsResponseDataFormat = {
  id: expect.any(String),
  content: expect.any(String),
  publishedAt: expect.any(String),
  updatedAt: null,
  author: { username: expect.any(String) },
};
