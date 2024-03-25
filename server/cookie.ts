import { server } from "./index.ts";

export const createCookie = (
  name: string,
  value: string,
  {
    path = "/",
    expires,
    maxAge,
    domain = server.url.hostname,
    secure = server.url.protocol === "https:",
    httpOnly = true,
    sameSite = "Strict",
  }: {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  } = {},
) => {
  return `${name}=${value}; ${
    path ? `Path=${path}; ` : ""
  }${expires ? `Expires=${expires.toUTCString()}; ` : ""}${
    maxAge ? `Max-Age=${maxAge}; ` : ""
  }${domain ? `Domain=${domain}; ` : ""}${
    secure ? "Secure; " : ""
  }${httpOnly ? "HttpOnly; " : ""}${sameSite ? `SameSite=${sameSite}; ` : ""}`;
};

export function clearCookie(name: string, options: { path?: string } = {}) {
  return `${name}=; Path=${options.path || "/"}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
