import { Database } from "bun:sqlite";
import seed from "./seed.ts";
import { BadRequestError } from "./Error.ts";

const dbExists = await Bun.file("db.sqlite").exists();
const db = new Database("db.sqlite");
if (!dbExists) {
  seed(db);
}

export function userExists(username: string) {
  return !!db
    .query("SELECT username FROM user WHERE username = ?")
    .get(username.toLowerCase());
}

export function createUser(username: string, password: string) {
  const encryptedPassword = Bun.password.hashSync(password);
  db.query("INSERT INTO user (username, password) VALUES (?, ?)").run(
    username.toLowerCase(),
    encryptedPassword,
  );
}

export function loginUser(username: string, password: string) {
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
    "INSERT INTO session (token, user_id, expires_at) VALUES (?, ?, ?)",
  ).run(token, user.id, expiresAt);

  return {
    token,
    expiresAt,
  };
}

export function logoutUser(token: string) {
  db.query("DELETE FROM session WHERE token = ?").run(token);
}

export function getUser(req: Request) {
  const token = req.cookies?.session;
  if (!token) return null;
  const result = db
    .query<{ id: number; username: string; expires_at: number }, string>(
      `
SELECT user.id, user.username, session.expires_at
FROM session
JOIN user ON user.id = session.user_id
WHERE token = ?
`,
    )
    .get(token);
  if (!result) return null;
  const { expires_at, ...user } = result;
  if (expires_at < Date.now()) {
    db.query("DELETE FROM session WHERE token = ?").run(token);
    return null;
  }
  return user;
}

// delete expired sessions every 30 minutes
function clearExpiredSessions() {
  db.query("DELETE FROM session WHERE expires_at < ?").run(Date.now());
  setTimeout(clearExpiredSessions, 30 * 60 * 1000);
}
clearExpiredSessions();

export function createBoard({
  name,
  color,
  userId,
}: {
  name: string;
  color: string;
  userId: number;
}) {
  db.query("INSERT INTO board (name, color, user_id) VALUES (?, ?, ?)").run(
    name,
    color,
    userId,
  );
  const { id } = db
    .query<{ id: number }, null>("SELECT last_insert_rowid() AS id")
    .get(null)!;
  return {
    id,
    name,
    color,
  };
}

export function getBoards(userId: number) {
  return db
    .query<
      {
        id: number;
        name: string;
        color: string;
      },
      number
    >("SELECT id, name, color FROM board WHERE user_id = ?")
    .all(userId);
}

export function getBoard(id: number, userId: number) {
  return db
    .query<
      {
        id: number;
        name: string;
        color: string;
      },
      [number, number]
    >("SELECT id, name, color FROM board WHERE id = ? AND user_id = ?")
    .get(id, userId);
}

export function deleteBoard(id: number) {
  db.query("DELETE FROM board WHERE id = ?").run(id);
}
