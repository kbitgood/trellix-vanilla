import { index } from "./index.ts";

export function parseCookies(
  request: Request,
): Record<string, string> | undefined {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return undefined;
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("=")),
  );
}

export function createCookieStr(
  name: string,
  value: string,
  {
    path = "/",
    expires,
    maxAge,
    domain = index?.url.hostname,
    secure = index?.url.protocol === "https:",
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
) {
  return `${name}=${value}; ${
    path ? `Path=${path}; ` : ""
  }${expires ? `Expires=${expires.toUTCString()}; ` : ""}${
    maxAge ? `Max-Age=${maxAge}; ` : ""
  }${domain ? `Domain=${domain}; ` : ""}${
    secure ? "Secure; " : ""
  }${httpOnly ? "HttpOnly; " : ""}${sameSite ? `SameSite=${sameSite}; ` : ""}`;
}

export function clearCookieStr(name: string, options: { path?: string } = {}) {
  return `${name}=; Path=${options.path || "/"}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
