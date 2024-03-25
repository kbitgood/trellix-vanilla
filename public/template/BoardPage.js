import Layout from "./Layout.js";
import Column from "./Column.js";

/**
 * @param {Object} params
 * @param {{id:number, name:string, color: string}} params.board
 * @param {Array<{id:string, name:string, boardId: number}>} params.columns
 * @param {Array<{id:string, text: string, sortOrder:number, columnId:string}>} params.items
 * @returns {string}
 */
export default function BoardPage({ board, columns, items }) {
  return Layout(
    {
      loggedIn: true,
      title: `${board.name} Board in Trellix-Vanilla`,
      scripts: ["/js/board.js"],
      bodyStyle: `background-color: ${board.color}; height: 100vh;`,
    },
    `
<main class="board">
  <h1>
    <button aria-label="Edit board &quot;${board.name}&quot; name" type="button">${board.name}</button>
  </h1>
  <div class="columns">
    ${columns
      .map((column) => {
        const columnItems = items.filter((item) => item.columnId === column.id);
        return Column({ column, items: columnItems });
      })
      .join("\n")}
    <button aria-label="Add new column" class="add-column">
      <svg><use href="/img/icons.svg#plus"></use></svg>
    </button>
    <div data-lol="true" class="spacer"></div>
  </div>
</main>
`,
  );
}
