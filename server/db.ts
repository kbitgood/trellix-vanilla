import { existsSync } from "fs";
import { join } from "path";
import { Database } from "bun:sqlite";
import seed from "./seed.ts";
import { BadRequestError } from "./error.ts";
import type { BoardData, ColumnData, ItemData, UserData } from "./model.ts";

const litefs = join(
  process.env.NODE_ENV === "production" ? "/var/lib" : ".",
  "litefs",
);
if (!existsSync(litefs)) {
  console.error("Unable to reach", litefs);
  process.exit(1);
}
const db = new Database(join(litefs, "db.sqlite"));
seed(db);

export const user = {
  exists(username: string) {
    return !!db
      .query("SELECT username FROM users WHERE username = ?")
      .get(username.toLowerCase());
  },
  create(username: string, password: string) {
    const encryptedPassword = Bun.password.hashSync(password);
    db.query("INSERT INTO users (username, password) VALUES (?, ?)").run(
      username.toLowerCase(),
      encryptedPassword,
    );
  },
};

export const session = {
  login(username: string, password: string) {
    // get user
    const user = db
      .query<
        { id: number; password: string },
        string
      >("SELECT id, password FROM users WHERE username = ?")
      .get(username.toLowerCase());
    if (!user || !Bun.password.verifySync(password, user.password)) {
      throw new BadRequestError("Invalid username or password");
    }
    // create session
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 1 week
    db.query(
      "INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)",
    ).run(token, user.id, expiresAt);

    return {
      token,
      expiresAt,
    };
  },
  logout(token: string) {
    db.query("DELETE FROM sessions WHERE token = ?").run(token);
  },
  getUser(token: string | undefined): UserData | null {
    if (!token) return null;
    const result = db
      .query<{ id: number; username: string; expiresAt: number }, string>(
        `
SELECT u.id, u.username, s.expiresAt
FROM sessions s
JOIN users u ON u.id = s.userId
WHERE s.token = ?
`,
      )
      .get(token);
    if (!result) return null;
    const { expiresAt, ...user } = result;
    if (expiresAt < Date.now()) {
      db.query("DELETE FROM sessions WHERE token = ?").run(token);
      return null;
    }
    return user;
  },
};

// delete expired sessions every 30 minutes
function clearExpiredSessions() {
  db.query("DELETE FROM sessions WHERE expiresAt < ?").run(Date.now());
  setTimeout(clearExpiredSessions, 30 * 60 * 1000);
}
clearExpiredSessions();

export const boards = {
  create(board: { name: string; color: string; userId: number }) {
    db.query("INSERT INTO boards (name, color, userId) VALUES (?, ?, ?)").run(
      board.name,
      board.color,
      board.userId,
    );
    const { id } = db
      .query<{ id: number }, null>("SELECT last_insert_rowid() AS id")
      .get(null)!;
    return { id, ...board };
  },
  all(userId: number) {
    return db
      .query<
        BoardData,
        number
      >("SELECT id, name, color FROM boards WHERE userId = ?")
      .all(userId);
  },
  get(id: number, userId: number) {
    return db
      .query<
        BoardData,
        [number, number]
      >("SELECT id, name, color FROM boards WHERE id = ? AND userId = ?")
      .get(id, userId);
  },
  update(id: number, name: string) {
    db.query("UPDATE boards SET name = ? WHERE id = ?").run(name, id);
  },
  delete(id: number) {
    db.query("DELETE FROM boards WHERE id = ?").run(id);
  },
};

export const columns = {
  create(column: { id?: string; name: string; boardId: number }) {
    const id = column.id || crypto.randomUUID();
    const sortOrder =
      db
        .query<
          { sortOrder: number },
          number
        >("SELECT COUNT(*) + 1 AS sortOrder FROM columns WHERE boardId = ?")
        .get(column.boardId)?.sortOrder || 1;
    db.query(
      "INSERT INTO columns (id, name, boardId, sortOrder) VALUES (?, ?, ?, ?)",
    ).run(id, column.name, column.boardId, sortOrder);
    return { id, ...column };
  },
  get(id: string, boardId: number) {
    return db
      .query<
        ColumnData,
        [string, number]
      >("SELECT id, name, boardId, sortOrder FROM columns WHERE id = ? AND boardId = ?")
      .get(id, boardId);
  },
  all(boardId: number) {
    return db
      .query<
        ColumnData,
        number
      >("SELECT id, name, boardId, sortOrder FROM columns WHERE boardId = ?")
      .all(boardId);
  },
  update(id: string, name: string) {
    db.query("UPDATE columns SET name = ? WHERE id = ?").run(name, id);
  },
  move(column: ColumnData, sortOrder: number) {
    // shift columns from old position down
    db.query(
      `
UPDATE columns
SET sortOrder = sortOrder - 1
WHERE sortOrder > ? AND boardId = ? AND id != ?
`,
    ).run(column.sortOrder, column.boardId, column.id);
    // shift columns from new position up
    db.query(
      `
UPDATE columns
SET sortOrder = sortOrder + 1
WHERE sortOrder >= ? AND boardId = ? AND id != ?
`,
    ).run(sortOrder, column.boardId, column.id);
    // update column
    db.query(
      `
UPDATE columns
SET sortOrder = ?
WHERE id = ?
`,
    ).run(sortOrder, column.id);
  },
  delete(id: string) {
    db.query("DELETE FROM columns WHERE id = ?").run(id);
  },
};

export const items = {
  create(item: { id?: string; text: string; columnId: string }) {
    const id = item.id || crypto.randomUUID();
    const sortOrder =
      db
        .query<
          { sortOrder: number },
          string
        >("SELECT COUNT(*) + 1 AS sortOrder FROM items WHERE columnId = ?")
        .get(item.columnId)?.sortOrder || 1;
    db.query(
      "INSERT INTO items (id, `text`, columnId, sortOrder) VALUES (?, ?, ?, ?)",
    ).run(id, item.text, item.columnId, sortOrder);
    return { id, ...item };
  },
  get(id: string, columnId: string) {
    return db
      .query<
        ItemData,
        [string, string]
      >("SELECT id, `text`, columnId, sortOrder FROM items WHERE id = ? AND columnId = ?")
      .get(id, columnId);
  },
  getByBoardId(id: string, boardId: number) {
    return db
      .query<
        ItemData,
        [string, number]
      >("SELECT i.id, i.`text`, i.columnId, i.sortOrder FROM items i JOIN columns c ON c.id = i.columnId WHERE i.id = ? AND c.boardId = ?")
      .get(id, boardId);
  },
  all(boardId: number) {
    return db
      .query<ItemData, number>(
        `
SELECT i.id, i.text, i.columnId, i.sortOrder
FROM items i
JOIN columns c ON c.id = i.columnId
WHERE c.boardId = ?
ORDER BY i.sortOrder
`,
      )
      .all(boardId);
  },
  delete(id: string) {
    db.query(
      `
UPDATE items
SET sortOrder = sortOrder - 1
WHERE sortOrder > (SELECT sortOrder FROM items WHERE id = ?)
`,
    ).run(id);
    db.query("DELETE FROM items WHERE id = ?").run(id);
  },
  move(item: ItemData, columnId: string, sortOrder: number) {
    // shift items from old column down
    db.query(
      `
UPDATE items
SET sortOrder = sortOrder - 1
WHERE columnId = ? AND sortOrder > ? AND id != ?
`,
    ).run(item.columnId, item.sortOrder, item.id);
    // shift items from new column up
    db.query(
      `
UPDATE items
SET sortOrder = sortOrder + 1
WHERE columnId = ? AND sortOrder >= ? AND id != ?
`,
    ).run(columnId, sortOrder, item.id);
    // update item
    db.query(
      `
UPDATE items
SET columnId = ?, sortOrder = ?
WHERE id = ?
`,
    ).run(columnId, sortOrder, item.id);
  },
};
