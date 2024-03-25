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
      .query("SELECT username FROM user WHERE username = ?")
      .get(username.toLowerCase());
  },
  create(username: string, password: string) {
    const encryptedPassword = Bun.password.hashSync(password);
    db.query("INSERT INTO user (username, password) VALUES (?, ?)").run(
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
      >("SELECT id, password FROM user WHERE username = ?")
      .get(username.toLowerCase());
    if (!user || !Bun.password.verifySync(password, user.password)) {
      throw new BadRequestError("Invalid username or password");
    }
    // create session
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 1 week
    db.query(
      "INSERT INTO session (token, userId, expiresAt) VALUES (?, ?, ?)",
    ).run(token, user.id, expiresAt);

    return {
      token,
      expiresAt,
    };
  },
  logout(token: string) {
    db.query("DELETE FROM session WHERE token = ?").run(token);
  },
  getUser(token: string | undefined) {
    if (!token) return null;
    const result = db
      .query<{ id: number; username: string; expiresAt: number }, string>(
        `
SELECT user.id, user.username, session.expiresAt
FROM session
JOIN user ON user.id = session.userId
WHERE token = ?
`,
      )
      .get(token);
    if (!result) return null;
    const { expiresAt, ...user } = result;
    if (expiresAt < Date.now()) {
      db.query("DELETE FROM session WHERE token = ?").run(token);
      return null;
    }
    return user;
  },
};

// delete expired sessions every 30 minutes
function clearExpiredSessions() {
  db.query("DELETE FROM session WHERE expiresAt < ?").run(Date.now());
  setTimeout(clearExpiredSessions, 30 * 60 * 1000);
}
clearExpiredSessions();

export type Board = {
  id: number;
  name: string;
  color: string;
  userId: number;
};
export const boards = {
  create(board: Omit<Board, "id">): Board {
    db.query("INSERT INTO board (name, color, userId) VALUES (?, ?, ?)").run(
      board.name,
      board.color,
      board.userId,
    );
    const { id } = db
      .query<{ id: number }, null>("SELECT last_insert_rowid() AS id")
      .get(null)!;
    return { id, ...board };
  },
  all(userId: number): Board[] {
    return db
      .query<
        {
          id: number;
          name: string;
          color: string;
          userId: number;
        },
        number
      >("SELECT id, name, color, userId FROM board WHERE userId = ?")
      .all(userId);
  },
  get(id: number, userId: number): Board | null {
    return db
      .query<
        {
          id: number;
          name: string;
          color: string;
          userId: number;
        },
        [number, number]
      >("SELECT id, name, color, userId FROM board WHERE id = ? AND userId = ?")
      .get(id, userId);
  },
  delete(id: number) {
    db.query("DELETE FROM board WHERE id = ?").run(id);
  },
};
