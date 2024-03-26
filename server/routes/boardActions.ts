import type { RouteContext } from "../server.ts";
import * as db from "../db.ts";
import { BadRequestError, NotFoundError } from "../error.ts";
import type { BoardData, UserData } from "../model.ts";
import { hasProp } from "./lib.ts";

function createAction<
  ReturnType,
  NeedsBoard extends boolean = true,
  Fields extends string | never = never,
>(
  options: { requireBoard?: NeedsBoard; requiredFields?: Fields[] },
  handler: (
    ctx: NoInfer<{
      user: UserData;
      board: NeedsBoard extends true ? BoardData : BoardData | null;
      data: Record<Fields, string>;
    }>,
  ) => ReturnType,
) {
  return ({
    urlParams,
    user,
    formData,
  }: RouteContext<false> & { formData: FormData }) => {
    const boardId = urlParams[0];
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
      board: board as NeedsBoard extends true ? BoardData : BoardData | null,
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

export const updateBoardName = createAction(
  { requiredFields: ["name"] },
  ({ board, data }) => {
    db.boards.update(board.id, data.name);
    return {
      ...board,
      name: data.name,
    };
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

export const updateColumnName = createAction(
  { requiredFields: ["columnId", "name"] },
  ({ board, data }) => {
    const column = db.columns.get(data.columnId, board.id);
    if (!column) {
      throw new NotFoundError(`Column ${data.columnId} not found`);
    }

    db.columns.update(data.columnId, data.name);
    return { ...column, name: data.name };
  },
);

export const moveColumn = createAction(
  { requiredFields: ["columnId", "sortOrder"] },
  ({ board, data }) => {
    const { columnId, sortOrder } = data;
    const column = db.columns.get(columnId, board.id);
    if (!column) {
      throw new NotFoundError(`Column ${columnId} not found`);
    }
    db.columns.move(column, parseInt(sortOrder));
    return { success: true };
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
  { requiredFields: ["text", "columnId"] },
  ({ board, data }) => {
    if (!db.columns.get(data.columnId, board.id))
      throw new NotFoundError(`Column ${data.columnId} not found`);

    return db.items.create({
      id: hasProp("id", data) ? data.id : undefined,
      text: data.text,
      columnId: data.columnId,
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

export const moveItem = createAction(
  { requiredFields: ["itemId", "columnId", "sortOrder"] },
  ({ board, data }) => {
    const { itemId, columnId, sortOrder } = data;
    const item = db.items.getByBoardId(itemId, board.id);
    if (!item) {
      throw new NotFoundError(`Item ${itemId} not found`);
    }
    if (!db.columns.get(columnId, board.id)) {
      throw new NotFoundError(`Column ${data.columnId} not found`);
    }
    db.items.move(item, columnId, parseInt(sortOrder));
    return { success: true };
  },
);
