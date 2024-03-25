import { apiHandler } from "./api";
import { getUser, logoutUser } from "./db.ts";
import { clearCookie } from "./cookie.ts";

console.log("Starting server");

declare global {
  interface Request {
    cookies?: Record<string, string>;
  }
}

const codeAssetFilePattern = /(\.css|\.js)$/;
const assetFilePattern = /(?<!\/\w+|\.html|\.css|\.js)$/;
const publicRoutes = [
  /^\/(login|signup|index)?$/,
  /^\/api\/(login|signup)$/,
  codeAssetFilePattern,
  assetFilePattern,
];

export const server = Bun.serve({
  fetch: async function (req) {
    req.cookies = parseCookies(req);
    const url = new URL(req.url);
    let response: Response;

    try {
      if (!getUser(req) && !publicRoutes.some((r) => r.test(url.pathname))) {
        response = new Response("Unauthorized", { status: 401 });
      } else if (url.pathname.startsWith("/api")) {
        response = await apiHandler(req);
      } else if (url.pathname === "/logout") {
        if (req.cookies?.session) {
          logoutUser(req.cookies.session);
        }
        response = new Response("", {
          status: 302,
          headers: { Location: "/login" },
        });
        response.headers.append("Set-Cookie", clearCookie("session"));
      } else {
        response = await serveStaticFiles(req);
      }
    } catch (e) {
      response = errorHandler(e);
    }
    console.log(`${req.method} ${req.url} -> ${response.status}`);
    if (req.cookies?.session && !getUser(req)) {
      response.headers.append("Set-Cookie", clearCookie("session"));
    }
    return response;
  },
});

console.log("Server started at", server.url.href);

function parseCookies(req: Request): Record<string, string> | undefined {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return undefined;
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("=")),
  );
}

async function serveStaticFiles(req: Request) {
  const url = new URL(req.url);
  let filepath = url.pathname;
  if (filepath === "/") filepath = "/index.html";
  if (!filepath.match(/\.(\w+)$/)) filepath += ".html";
  filepath = Bun.resolveSync("../client" + filepath, import.meta.dir);
  const file = Bun.file(filepath);
  if (!(await file.exists())) {
    console.log("File not found:", filepath);
    return new Response("Not found", { status: 404 });
  }
  return new Response(file, {
    headers: {
      "Cache-Control": assetFilePattern.test(url.pathname)
        ? "public, max-age=3600"
        : "no-cache",
    },
  });
}

function errorHandler(e: unknown) {
  console.error(e);
  const name =
    typeof e === "object" && !!e && e.constructor.name
      ? e.constructor.name
      : "Error";
  const message =
    typeof e === "object" && !!e && "message" in e
      ? e.message
      : typeof e === "string"
        ? e
        : "Unknown error";
  return new Response(`Internal Server ${name}: ${message}`, {
    status: 500,
  });
}
export { clearCookie } from "./cookie.ts";
export { createCookie } from "./cookie.ts";
