import type { RouteContext } from "../server.ts";
import * as db from "../db.ts";
import { BadRequestError, NotFoundError } from "../error.ts";

function createAction<
  ReturnType,
  NeedsBoard extends boolean = true,
  Fields extends string | never = never,
>(
  options: { requireBoard?: NeedsBoard; requiredFields?: Fields[] },
  handler: (
    ctx: NoInfer<{
      user: Model.User;
      board: NeedsBoard extends true ? Model.Board : Model.Board | null;
      data: Record<Fields, string>;
    }>,
  ) => ReturnType,
) {
  return ({
    urlParams,
    user,
    formData,
  }: RouteContext<false> & { formData: FormData }) => {
    const boardId = parseInt(urlParams[0]);
    const board = db.boards.get(boardId, user.id);
    if (options.requireBoard !== false && !board) {
      throw new NotFoundError(`Board ${urlParams[0]} not found`);
    }
    const data = Object.fromEntries(formData.entries());
    for (const field of options.requiredFields ?? []) {
      if (!hasProp(field, data)) {
        throw new BadRequestError(`Missing required field: ${field}`);
      }
    }
    return handler({
      user,
      board: board as NeedsBoard extends true
        ? Model.Board
        : Model.Board | null,
      data: data as Record<Fields, string>,
    });
  };
}

export const deleteBoard = createAction(
  { requireBoard: false },
  ({ board }) => {
    if (board) {
      db.boards.delete(board.id);
    }
    return { success: true };
  },
);

export const createColumn = createAction(
  { requiredFields: ["name"] },
  ({ board, data }) => {
    const name = data.name;
    const id = hasProp("id", data) ? data.id : undefined;
    return db.columns.create({ id, name, boardId: board.id });
  },
);

export const deleteColumn = createAction(
  { requiredFields: ["columnId"] },
  ({ data }) => {
    db.columns.delete(data.columnId);
    return { success: true };
  },
);

export const createItem = createAction(
  { requiredFields: ["text", "columnId", "sortOrder"] },
  ({ board, data }) => {
    if (!db.columns.get(data.columnId, board.id))
      throw new NotFoundError(`Column ${data.columnId} not found`);

    return db.items.create({
      id: hasProp("id", data) ? data.id : undefined,
      text: data.text,
      columnId: data.columnId,
      sortOrder: parseInt(data.sortOrder),
    });
  },
);

export const deleteItem = createAction(
  { requiredFields: ["itemId"] },
  ({ board, data: { itemId } }) => {
    const item = db.items.getByBoardId(itemId, board.id);
    if (item) {
      db.items.delete(itemId);
    }
    return { success: true };
  },
);

function hasProp<Prop extends string>(
  prop: Prop,
  obj: unknown,
): obj is { [K in Prop]: string } {
  return obj !== null && typeof obj === "object" && prop in obj;
}