import type { Database } from "bun:sqlite";

export default function seed(db: Database) {
  db.query(
    `
        CREATE TABLE user
        (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        );
    `,
  ).run();

  db.query(
    `
        CREATE TABLE session
        (
            token      TEXT PRIMARY KEY NOT NULL,
            user_id    INTEGER NOT NULL,
            expires_at DATE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user (id)
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
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user (id)
        );
    `,
  ).run();
}
