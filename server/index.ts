import type { Server } from "bun";
import * as db from "./db.ts";
import { HTTPError, NotFoundError, UnauthorizedError } from "./error.ts";
import { clearCookieStr, parseCookies } from "./cookie.ts";
import type { HeadersInit } from "undici-types/fetch";

declare global {
  interface Request {
    cookies?: Record<string, string>;
  }
}
export let index: Server | undefined;
export function startServer() {
  index = Bun.serve({
    fetch: async function (request) {
      request.cookies = parseCookies(request);
      let response: Response | null = null;
      const user = db.session.getUser(request.cookies?.session);

      try {
        // handle public routes
        const publicRoutes = routes.filter((r) => r.public);
        response = await handleRoutes(publicRoutes, request, user);

        // require authentication
        if (!response && !user) {
          response = errorHandler(
            new UnauthorizedError(
              "You must be logged in to " +
                (request.method === "GET"
                  ? "access this resource"
                  : "perform this action"),
            ),
            request,
          );
        }

        // handle private routes
        if (!response) {
          const privateRoutes = routes.filter((r) => !r.public);
          response = await handleRoutes(privateRoutes, request, user);
        }

        // no matching route found
        if (!response) {
          response = errorHandler(
            new NotFoundError(
              `No matching route found for ${request.method} ${new URL(request.url).pathname}`,
            ),
            request,
          );
        }
      } catch (e) {
        response = errorHandler(e, request);
      }
      console.log(`${request.method} ${request.url} -> ${response.status}`);
      if (request.cookies?.session && !user) {
        response.headers.append("Set-Cookie", clearCookieStr("session"));
      }
      return response;
    },
  });
  console.log("Server started at", index.url.href);
}

async function handleRoutes(
  routes: RouteDefinition[],
  request: Request,
  user: ReturnType<typeof db.session.getUser>,
): Promise<Response | null> {
  const url = new URL(request.url);
  for (const route of routes) {
    const match = url.pathname.match(route.pattern);
    if (route.methods.includes(request.method) && match) {
      const ctx = { request, urlParams: match.slice(1), user };
      if ("handler" in route) {
        return route.handler(ctx);
      } else {
        const fileName =
          typeof route.file === "function" ? route.file(ctx) : route.file;
        const file = Bun.file(`${import.meta.dir}/../client/${fileName}`);
        if (!(await file.exists())) {
          throw new Error(`File returned from route not found: ${fileName}`);
        }
        return new Response(file);
      }
    }
  }
  return null;
}

function errorHandler(e: unknown, request: Request): Response {
  console.error(e);
  let name =
    "Internal Server " +
    (typeof e === "object" && !!e && e.constructor.name
      ? e.constructor.name
      : "Error");
  const message =
    typeof e === "object" && !!e && "message" in e
      ? e.message
      : typeof e === "string"
        ? e
        : "Unknown error";
  let status = 500;
  if (e instanceof HTTPError) {
    status = e.status;
    name = e.statusText;
  }

  new Response("", { headers: {} });

  if (request.headers.get("Accept")?.includes("application/json")) {
    return Response.json({ success: false, error: { message } }, { status });
  }
  if (status === 401) {
    return new Response("", { status: 302, headers: { Location: "/login" } });
  }
  return new Response(`${name}: ${message}`, { status });
}

type RouteContext<Public extends boolean = boolean> = {
  request: Request;
  urlParams: string[];
  user: Public extends false
    ? ReturnType<typeof db.session.getUser> & {}
    : ReturnType<typeof db.session.getUser>;
};

type RouteDefinition<Public extends boolean = boolean> = {
  methods: string[];
  pattern: RegExp;
  public?: Public;
} & (
  | {
      handler: (ctx: RouteContext<Public>) => Promise<Response> | Response;
    }
  | {
      file: string | ((ctx: RouteContext<Public>) => string);
      headers?: HeadersInit;
    }
);

const routes: RouteDefinition[] = [];

export function createRoute<Public extends boolean = false>(
  route: RouteDefinition<Public>,
) {
  routes.push(route);
}
