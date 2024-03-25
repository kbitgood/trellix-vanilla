import type { Database } from "bun:sqlite";

export default function seed(db: Database) {
  db.query(
    `
        CREATE TABLE IF NOT EXISTS users
        (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            UNIQUE (username)
        );
    `,
  ).run();

  db.query(
    `
        CREATE TABLE IF NOT EXISTS sessions
        (
            token     TEXT PRIMARY KEY NOT NULL,
            userId    INTEGER NOT NULL,
            expiresAt DATE NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        );
    `,
  ).run();

  db.query(
    `
        CREATE TABLE IF NOT EXISTS boards
        (
            id     INTEGER PRIMARY KEY AUTOINCREMENT,
            name   TEXT NOT NULL,
            color  TEXT NOT NULL,
            userId INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        );
    `,
  ).run();

  db.query(
    `
        CREATE TABLE IF NOT EXISTS columns
        (
            id      TEXT PRIMARY KEY NOT NULL,
            name    TEXT NOT NULL,
            boardId INTEGER NOT NULL,
            sortOrder INTEGER NOT NULL,
            FOREIGN KEY (boardId) REFERENCES boards (id) ON DELETE CASCADE
        );
    `,
  ).run();

  db.query(
    `
        CREATE TABLE IF NOT EXISTS items
        (
            id        TEXT PRIMARY KEY NOT NULL,
            text      TEXT NOT NULL,
            columnId  TEXT NOT NULL,
            sortOrder INTEGER NOT NULL,
            FOREIGN KEY (columnId) REFERENCES columns (id) ON DELETE CASCADE
        );
    `,
  ).run();
}
