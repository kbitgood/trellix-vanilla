import { HTTPError } from "../Error.ts";
import { readdir } from "node:fs/promises";

type RouteDefinition = {
  method?: string;
  path: string | RegExp;
  handler: (req: Request) => Response | Promise<Response>;
};

const createRouteSymbol = Symbol("route created with helper function");
export function createRoute({
  method = "GET",
  path,
  handler,
}: RouteDefinition) {
  return { method, path, handler, symbol: createRouteSymbol };
}

const files = (await readdir(import.meta.dir)).filter(
  (file) => file.endsWith(".ts") && file !== import.meta.file,
);
const routes = (
  await Promise.all(
    files.map(async (file) =>
      sanitizeRoutes((await import(`./${file}`)).default, file),
    ),
  )
).flat();

function sanitizeRoutes(routes: unknown, file: string) {
  if (Array.isArray(routes)) {
    return routes.flatMap((r) => sanitizeRoute(r, file));
  }
  return [sanitizeRoute(routes, file)];
}

function sanitizeRoute(route: unknown, file: string) {
  if (!checkRoute(route)) {
    throw new Error(
      `Export from ${import.meta.dir}/${file} is not a route object. ` +
        "Use the createRoute helper function to create routes.",
    );
  }
  return { ...route, filepath: `${import.meta.dir}/${file}` };
}

function checkRoute(
  route: unknown,
): route is RouteDefinition & { symbol: typeof createRouteSymbol } {
  return (
    !!route &&
    typeof route === "object" &&
    "method" in route &&
    typeof route.method === "string" &&
    "path" in route &&
    (typeof route.path === "string" || route.path instanceof RegExp) &&
    "handler" in route &&
    typeof route.handler === "function" &&
    "symbol" in route &&
    route.symbol === createRouteSymbol
  );
}

export async function apiHandler(req: Request) {
  try {
    const pathname = new URL(req.url).pathname;
    for (const route of routes) {
      if (route.method === req.method && routeMatches(route.path, pathname)) {
        return await route.handler(req);
      }
    }
  } catch (e) {
    if (e instanceof HTTPError) {
      return Response.json(
        { success: false, error: { message: `${e.statusText}: ${e.message}` } },
        { status: e.status },
      );
    } else {
      throw e;
    }
  }
  return Response.json(
    { success: false, error: { message: "Not found" } },
    { status: 404 },
  );
}

function routeMatches(path: RouteDefinition["path"], pathname: string) {
  if (typeof path === "string") {
    return path === pathname;
  } else {
    return path.test(pathname);
  }
}
