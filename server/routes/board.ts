import { createRouteHelper } from "../server.ts";
import * as db from "../db.ts";
import { BadRequestError, NotFoundError } from "../error.ts";
import BoardPage from "../template/BoardPage.ts";
import * as boardActions from "./boardActions.ts";
type Intents = keyof typeof boardActions;
const intents = Object.keys(boardActions) as Intents[];

createRouteHelper({
  methods: ["GET"],
  pattern: /^\/board\/([a-zA-Z0-9]+)$/i,
  handler: ({ request, urlParams, user }) => {
    const id = urlParams[0];
    const board = db.boards.get(id, user.id);
    if (!board) {
      throw new NotFoundError(`Board ${id} not found`);
    }
    const columns = db.columns.all(id);
    const items = db.items.all(id);
    const pageData = { board, columns, items };
    if (request.headers.get("Accept")?.includes("application/json")) {
      return Response.json(pageData, { status: 201 });
    } else {
      const html = BoardPage(pageData);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  },
});

createRouteHelper({
  methods: ["POST"],
  pattern: /^\/board\/([a-zA-Z0-9]+)$/i,
  handler: async (ctx) => {
    const formData = await ctx.request.formData();
    const intent = formData.get("intent");
    if (!isOneOf(intent, intents)) {
      throw new BadRequestError("Invalid form data");
    }

    const data = boardActions[intent]({ ...ctx, formData });

    if (ctx.request.headers.get("Accept")?.includes("application/json")) {
      return Response.json(data ?? { success: true });
    } else {
      const board = db.boards.get(ctx.urlParams[0], ctx.user.id);
      return new Response("", {
        status: 302,
        headers: {
          Location:
            board === null ? "/home" : new URL(ctx.request.url).pathname,
        },
      });
    }
  },
});

function isOneOf<T>(value: unknown, values: T[]): value is T {
  return typeof value === "string" && values.includes(value as any);
}
