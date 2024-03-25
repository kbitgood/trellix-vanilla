import { createRoute } from "./index.ts";
import { BadRequestError, UnauthorizedError } from "../Error.ts";
import {
  createBoard,
  deleteBoard,
  getBoard,
  getBoards,
  getUser,
} from "../db.ts";

// noinspection JSUnusedGlobalSymbols
export default [
  createRoute({
    method: "POST",
    path: "/api/boards",
    handler: async function (req: Request) {
      const user = getUser(req);
      if (!user) {
        throw new UnauthorizedError("You must be logged in to create a board");
      }
      const formData = Object.fromEntries((await req.formData()).entries());
      if (!validateFormData(formData)) {
        throw new BadRequestError("Invalid form data");
      }
      const board = createBoard({ ...formData, userId: user.id });

      return Response.json(board, { status: 201 });
    },
  }),
  createRoute({
    method: "GET",
    path: "/api/boards",
    handler: async function (req: Request) {
      const user = getUser(req);
      if (!user) {
        throw new UnauthorizedError(
          "You must be logged in to view your boards",
        );
      }
      const boards = getBoards(user.id);
      return Response.json(boards);
    },
  }),
  createRoute({
    method: "DELETE",
    path: /^\/api\/boards\/(\d+)$/,
    handler: async function (req: Request) {
      const user = getUser(req);
      if (!user) {
        throw new UnauthorizedError("You must be logged in to delete a board");
      }
      const url = new URL(req.url);
      const boardId = parseInt(url.pathname.split("/").pop()!);
      const board = getBoard(boardId, user.id);
      if (board) {
        deleteBoard(board.id);
      }
      return new Response("", { status: 204 });
    },
  }),
];

function validateFormData(
  formData: unknown,
): formData is { name: string; color: string } {
  return (
    typeof formData === "object" &&
    formData !== null &&
    "name" in formData &&
    typeof formData.name === "string" &&
    "color" in formData &&
    typeof formData.color === "string"
  );
}
