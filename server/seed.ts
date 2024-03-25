import type { Database } from "bun:sqlite";

export default function seed(db: Database) {
  db.query(
    `
        CREATE TABLE user
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
        CREATE TABLE session
        (
            token      TEXT PRIMARY KEY NOT NULL,
            userId    INTEGER NOT NULL,
            expiresAt DATE NOT NULL,
            FOREIGN KEY (userId) REFERENCES user (id)
        );
    `,
  ).run();

  // create board table with numeric id, name, color, and foreign key to user
  db.query(
    `
        CREATE TABLE board
        (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            name    TEXT NOT NULL,
            color   TEXT NOT NULL,
            userId INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES user (id)
        );
    `,
  ).run();
}
