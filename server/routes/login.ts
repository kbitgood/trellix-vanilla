import { createRoute } from "../server.ts";
import SignupPage from "../template/SignupPage.ts";
import LoginPage from "../template/LoginPage.ts";
import SplashPage from "../template/SplashPage.ts";
import { BadRequestError } from "../error.ts";
import * as db from "../db.ts";
import { clearCookieStr, createCookieStr } from "../cookie.ts";

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
          domain: new URL(request.url).hostname,
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
