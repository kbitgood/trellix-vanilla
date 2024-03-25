declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT?: string;
      DATABASE_URL?: string;
      PUBLIC_DIR: string;
    }
  }
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

if (!process.env.PUBLIC_DIR) {
  process.env.PUBLIC_DIR = process.cwd() + "/public";
}
