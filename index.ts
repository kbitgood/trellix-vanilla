import "./server/env.ts";
import * as db from "./server/db.ts";
import { clearCookieStr, createCookieStr } from "./server/cookie.ts";
import { BadRequestError, NotFoundError } from "./server/error.ts";
import { startServer, createRoute } from "./server";
import SignupPage from "./public/template/SignupPage.js";
import LoginPage from "./public/template/LoginPage";
import SplashPage from "./public/template/SplashPage";
import HomePage from "./public/template/HomePage";

startServer();

// serve static asset files
createRoute({
  methods: ["GET"],
  pattern: /\.[^/]+$/i,
  public: true,
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const filePath = process.env.PUBLIC_DIR + url.pathname;
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      console.log("File not found:", filePath);
      throw new NotFoundError("File not found");
    }
    if (
      /\.(css|js)$/i.test(filePath) &&
      process.env.NODE_ENV !== "production"
    ) {
      return new Response(file);
    } else {
      return new Response(file, {
        headers: {
          "Cache-Control": "public, max-age=3600",
          ETag: String(file.lastModified),
        },
      });
    }
  },
});

// login routes
createRoute({
  methods: ["GET"],
  pattern: /^\/(login|signup)?$/i,
  public: true,
  handler: ({ urlParams, user }) => {
    if (user) {
      return new Response("", {
        status: 302,
        headers: { Location: "/home" },
      });
    }
    const pageTemplates: Record<string, () => string> = {
      signup: SignupPage,
      login: LoginPage,
    };
    let html = (pageTemplates[urlParams[0]] ?? SplashPage)();
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
});
createRoute({
  methods: ["POST"],
  pattern: /^\/(login|signup)$/i,
  public: true,
  handler: async function ({ request, urlParams }) {
    const formData = Object.fromEntries((await request.formData()).entries());
    if (
      typeof formData !== "object" ||
      formData === null ||
      !("username" in formData) ||
      typeof formData.username !== "string" ||
      !("password" in formData) ||
      typeof formData.password !== "string"
    ) {
      throw new BadRequestError("Invalid form data");
    }
    const { username, password } = formData;

    if (urlParams[0] === "signup") {
      if (db.user.exists(username)) {
        throw new BadRequestError(
          "An account with this username already exists.",
        );
      }
      db.user.create(username, password);
    }

    const { token, expiresAt } = db.session.login(username, password);
    return new Response("", {
      status: 302,
      headers: {
        Location: "/home",
        "Set-Cookie": createCookieStr("session", token, {
          expires: new Date(expiresAt),
        }),
      },
    });
  },
});
createRoute({
  methods: ["GET", "POST"],
  pattern: /^\/logout$/i,
  public: true,
  handler: ({ request }) => {
    if (request.cookies?.session) {
      db.session.logout(request.cookies.session);
    }
    return new Response("", {
      status: 302,
      headers: {
        Location: "/login",
        "Set-Cookie": clearCookieStr("session"),
      },
    });
  },
});

// home route
createRoute({
  methods: ["GET"],
  pattern: /^\/home$/i,
  handler: ({ user }) => {
    const boards = db.boards.all(user.id);
    const html = HomePage({ boards });
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
});

createRoute({
  methods: ["POST"],
  pattern: /^\/boards$/i,
  handler: async ({ request, user }) => {
    const formData = Object.fromEntries((await request.formData()).entries());
    if (
      typeof formData !== "object" ||
      formData === null ||
      !("name" in formData) ||
      typeof formData.name !== "string" ||
      !("color" in formData) ||
      typeof formData.color !== "string"
    ) {
      throw new BadRequestError("Invalid form data");
    }
    const { name, color } = formData;
    const board = db.boards.create({ name, color, userId: user.id });
    if (request.headers.get("Accept")?.includes("application/json")) {
      return Response.json(board, { status: 201 });
    } else {
      return new Response("", {
        status: 302,
        headers: { Location: `/board/${board.id}` },
      });
    }
  },
});
createRoute({
  methods: ["GET"],
  pattern: /^\/boards$/i,
  handler: ({ request, user }) => {
    const boards = db.boards.all(user.id);
    if (request.headers.get("Accept")?.includes("application/json")) {
      return Response.json(boards);
    } else {
      throw new NotFoundError("Not implemented");
    }
  },
});

createRoute({
  methods: ["GET"],
  pattern: /^\/board\/(\d+)$/i,
  handler: ({ request, urlParams, user }) => {
    const id = parseInt(urlParams[0]);
    const board = db.boards.get(id, user.id);
    if (!board) {
      throw new NotFoundError(`Board ${id} not found`);
    }
    if (request.headers.get("Accept")?.includes("application/json")) {
      return Response.json(board, { status: 201 });
    } else {
      throw new NotFoundError("Not implemented");
    }
  },
});
createRoute({
  methods: ["POST"],
  pattern: /^\/board\/(\d+)$/i,
  handler: async ({ request, user, urlParams }) => {
    const id = parseInt(urlParams[0]);
    const formData = Object.fromEntries((await request.formData()).entries());
    if (
      typeof formData !== "object" ||
      formData === null ||
      !("intent" in formData) ||
      typeof formData.intent !== "string" ||
      !["delete"].includes(formData.intent)
    ) {
      throw new BadRequestError("Invalid form data");
    }
    if (formData.intent === "delete") {
      const board = db.boards.get(id, user.id);
      if (board) {
        db.boards.delete(id);
      }
      if (request.headers.get("Accept")?.includes("application/json")) {
        return Response.json({ success: true }, { status: 204 });
      } else {
        return new Response("", {
          status: 302,
          headers: { Location: "/home" },
        });
      }
    } else {
      throw new BadRequestError("Invalid intent");
    }
  },
});
