import { Database } from "bun:sqlite";
import seed from "./seed.ts";
import { BadRequestError } from "./error.ts";

const dbExists = await Bun.file("db.sqlite").exists();
const db = new Database("db.sqlite");
if (!dbExists) {
  seed(db);
}

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
  getUser(token: string | undefined) {
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
        {
          id: number;
          name: string;
          color: string;
          userId: number;
        },
        number
      >("SELECT id, name, color, userId FROM boards WHERE userId = ?")
      .all(userId);
  },
  get(id: number, userId: number) {
    return db
      .query<
        {
          id: number;
          name: string;
          color: string;
          userId: number;
        },
        [number, number]
      >(
        "SELECT id, name, color, userId FROM boards WHERE id = ? AND userId = ?",
      )
      .get(id, userId);
  },
  delete(id: number) {
    db.query("DELETE FROM boards WHERE id = ?").run(id);
  },
};

export const columns = {
  create(column: { id?: string; name: string; boardId: number }) {
    const id = column.id || crypto.randomUUID();
    db.query("INSERT INTO columns (id, name, boardId) VALUES (?, ?, ?)").run(
      id,
      column.name,
      column.boardId,
    );
    return { id, ...column };
  },
  get(id: string, boardId: number) {
    return db
      .query<
        {
          id: string;
          name: string;
          boardId: number;
        },
        [string, number]
      >("SELECT id, name, boardId FROM columns WHERE id = ? AND boardId = ?")
      .get(id, boardId);
  },
  all(boardId: number) {
    return db
      .query<
        {
          id: string;
          name: string;
          boardId: number;
        },
        number
      >("SELECT id, name, boardId FROM columns WHERE boardId = ?")
      .all(boardId);
  },
  delete(id: string) {
    db.query("DELETE FROM columns WHERE id = ?").run(id);
  },
};

export const items = {
  create(item: {
    id?: string;
    text: string;
    columnId: string;
    sortOrder: number;
  }) {
    const id = item.id || crypto.randomUUID();
    db.query(
      "INSERT INTO items (id, `text`, columnId, sortOrder) VALUES (?, ?, ?, ?)",
    ).run(id, item.text, item.columnId, item.sortOrder);
    return { id, ...item };
  },
  get(id: string, columnId: string) {
    return db
      .query<
        {
          id: string;
          text: string;
          columnId: string;
          sortOrder: number;
        },
        [string, string]
      >(
        "SELECT id, `text`, columnId, sortOrder FROM items WHERE id = ? AND columnId = ?",
      )
      .get(id, columnId);
  },
  getByBoardId(id: string, boardId: number) {
    return db
      .query<
        {
          id: string;
          text: string;
          columnId: string;
          sortOrder: number;
        },
        [string, number]
      >(
        "SELECT i.id, i.`text`, i.columnId, i.sortOrder FROM items i JOIN columns c ON c.id = i.columnId WHERE i.id = ? AND c.boardId = ?",
      )
      .get(id, boardId);
  },
  all(boardId: number) {
    return db
      .query<
        {
          id: string;
          text: string;
          columnId: string;
          sortOrder: number;
        },
        number
      >(
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
};
