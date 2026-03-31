declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      APP_BASE_URL: string;
      DATABASE_URL: string;
      SALT_ROUNDS: string;
      COOKIE_SECURE: "auto";
      COOKIE_SAME_SITE: "lax";
      SESSION_SECRET: string;
    }
  }

  namespace Express {
    interface User {
      id: string;
      username: string;
    }
  }
}

export {};
