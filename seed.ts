import { join } from "path";
import { existsSync } from "fs";
import { Database } from "bun:sqlite";

const items = [
  {
    columnName: "stretch goals",
    columnOrder: 1,
    text: "make local first",
    sortOrder: 1,
  },
  {
    columnName: "stretch goals",
    columnOrder: 1,
    text: "make work without javascript!",
    sortOrder: 2,
  },
  {
    columnName: "todo",
    columnOrder: 2,
    text: "roll back reordering on server error",
    sortOrder: 1,
  },
  {
    columnName: "todo",
    columnOrder: 2,
    text: "mobile support",
    sortOrder: 2,
  },
  {
    columnName: "todo",
    columnOrder: 2,
    text: "make a video and post it",
    sortOrder: 3,
  },
  {
    columnName: "in progress",
    columnOrder: 3,
    text: "client side routing",
    sortOrder: 1,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "deploy live demo",
    sortOrder: 1,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "create github repo",
    sortOrder: 2,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "roll back on server error",
    sortOrder: 3,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "reorder column",
    sortOrder: 4,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "animate cards moving",
    sortOrder: 4,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "move item with drag and drop",
    sortOrder: 4,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "change name of board",
    sortOrder: 5,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "delete column",
    sortOrder: 5,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "delete item",
    sortOrder: 6,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "change name of column",
    sortOrder: 7,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "delete board",
    sortOrder: 8,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "create item",
    sortOrder: 9,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "create column",
    sortOrder: 10,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "create board",
    sortOrder: 11,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "un-tailwind",
    sortOrder: 12,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "roll your own auth",
    sortOrder: 13,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "log in/sign up page",
    sortOrder: 14,
  },
  {
    columnName: "done",
    columnOrder: 4,
    text: "splash page",
    sortOrder: 15,
  },
];

function generateId() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array(6)
    .fill(0)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

const litefs = join(
  process.env.NODE_ENV === "production" ? "/var/lib" : ".",
  "litefs",
);
if (!existsSync(litefs)) {
  console.error("Unable to reach", litefs);
  process.exit(1);
}
const db = new Database(join(litefs, "db.sqlite"));

for (const { text, sortOrder, columnName } of items) {
  const columnId = db
    .query<{ id: string }, string>(
      `
        SELECT id
        FROM columns
        WHERE name = ?
    `,
    )
    .get(columnName)?.id;
  if (!columnId) continue;
  const id = generateId();
  db.query(
    `
        INSERT INTO items (id, text, columnId, sortOrder)
        VALUES (?, ?, ?, ?)
    `,
  ).run(id, text, columnId, sortOrder);
}
