import { createRouteHelper } from "../server.ts";
import * as db from "../db.ts";
import HomePage from "../template/HomePage.ts";
import { BadRequestError, NotFoundError } from "../error.ts";
import { hasProp } from "./lib.ts";

createRouteHelper({
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

createRouteHelper({
  methods: ["POST"],
  pattern: /^\/boards$/i,
  handler: async ({ request, user }) => {
    const formData = Object.fromEntries((await request.formData()).entries());
    if (!hasProp("name", formData) || !hasProp("color", formData)) {
      throw new BadRequestError("Invalid form data");
    }
    const { name, color } = formData;
    const id = hasProp("id", formData) ? formData.id : undefined;
    const board = db.boards.create({ id, name, color, userId: user.id });
    if (request.headers.get("Accept")?.includes("application/json")) {
      return Response.json({ board, columns: [], items: [] }, { status: 201 });
    } else {
      return new Response("", {
        status: 302,
        headers: { Location: `/board/${board.id}` },
      });
    }
  },
});
createRouteHelper({
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
