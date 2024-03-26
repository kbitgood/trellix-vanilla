import type { Database } from "bun:sqlite";

const queries: Record<string, string> = {
  users: `
CREATE TABLE users
(
    id       TEXT PRIMARY KEY NOT NULL,
    username TEXT             NOT NULL,
    password TEXT             NOT NULL,
    UNIQUE (username)
)`,
  sessions: `
CREATE TABLE sessions
(
    token     TEXT PRIMARY KEY NOT NULL,
    userId    TEXT NOT NULL,
    expiresAt DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
)`,
  boards: `
CREATE TABLE boards
(
    id     TEXT PRIMARY KEY NOT NULL,
    name   TEXT NOT NULL,
    color  TEXT NOT NULL,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
)`,
  columns: `
CREATE TABLE columns
(
    id       TEXT PRIMARY KEY NOT NULL,
    name     TEXT NOT NULL,
    boardId  TEXT NOT NULL,
    sortOrder INTEGER NOT NULL,
    FOREIGN KEY (boardId) REFERENCES boards (id) ON DELETE CASCADE
)`,
  items: `
CREATE TABLE items
(
    id        TEXT PRIMARY KEY NOT NULL,
    text      TEXT NOT NULL,
    columnId  TEXT NOT NULL,
    sortOrder INTEGER NOT NULL,
    FOREIGN KEY (columnId) REFERENCES columns (id) ON DELETE CASCADE
)`,
};

function removeWhitespace(sql: string) {
  return sql
    .replaceAll(/\n/g, "")
    .replaceAll(/\s+(\W)/g, "$1")
    .replaceAll(/(\W)\s+/g, "$1")
    .replaceAll(/\s+/g, " ");
}

export default function seed(db: Database) {
  const shouldDelete = db
    .query<{ name: string; sql: string }, []>(
      'SELECT name, sql FROM sqlite_master WHERE type="table";',
    )
    .all()
    .some(({ name, sql }) => {
      const diff =
        removeWhitespace(queries[name] ?? "") !== removeWhitespace(sql);
      if (diff) {
        console.log("diff", name);
        console.log(removeWhitespace(queries[name] ?? ""));
        console.log(removeWhitespace(sql));
      }
    });
  if (shouldDelete) {
    console.log(
      "detected different schema, dropping tables and recreating them",
    );
    for (const table of Object.keys(queries)) {
      db.query(`DROP TABLE IF EXISTS ${table};`).run();
    }
    for (const sql of Object.values(queries)) {
      db.query(sql).run();
    }
  } else {
    console.log("database schema is up to date");
  }
}
