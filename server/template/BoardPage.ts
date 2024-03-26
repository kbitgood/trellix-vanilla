import Layout from "./Layout.ts";
import Board from "../../public/template/Board";
import type { BoardData, ColumnData, ItemData } from "../model.ts";

export default function BoardPage({
  board,
  columns,
  items,
}: {
  board: BoardData;
  columns: ColumnData[];
  items: ItemData[];
}) {
  return Layout(
    {
      loggedIn: true,
      title: `${board.name} Board in Trellix-Vanilla`,
      scripts: ["/js/main.js"],
      bodyStyle: `background-color: ${board.color}; height: 100vh;`,
    },
    Board({ board, columns, items }),
  );
}
