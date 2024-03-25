import { createRoute } from "../server.ts";
import * as db from "../db.ts";
import HomePage from "../template/HomePage.ts";
import { BadRequestError, NotFoundError } from "../error.ts";

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
