import { createRoute } from "../server.ts";
import { NotFoundError } from "../error.ts";

createRoute({
  methods: ["GET"],
  pattern: /\.[^/]+$/i,
  public: true,
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const filePath = import.meta.dirname + "/../../public" + url.pathname;
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
