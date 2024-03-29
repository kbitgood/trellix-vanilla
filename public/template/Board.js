import Column from "./Column.js";
import ActionForm from "./ActionForm.js";

/**
 * @param {{
 *   board: BoardData,
 *   columns: ColumnData[],
 *   items: ItemData[]
 * }} props
 * @return {string}
 */
export default function Board({ board, columns, items }) {
  return `
<main class="board">
  <h1>
    ${ActionForm(
      {
        className: "update-board-name",
        intent: "updateBoardName",
      },
      `<input
        required=""
        type="text"
        aria-label="Edit board name"
        name="name"
        value="${board.name}"
        autocomplete="off"
      >`,
    )}
  </h1>
  <div class="columns">
    <div class="column-list" style="display:contents;">
      ${columns
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((column) => {
          const columnItems = items
            .filter((item) => item.columnId === column.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          return Column({ column, items: columnItems });
        })
        .join("\n")}
    </div>
    <div class="new-column-container">
      ${ActionForm(
        { className: "new-column", intent: "createColumn" },
        `<input required="" type="text" name="name" autocomplete="off" onfocus="onNewColumnInputFocus()">
        <svg class="plus-icon"><use href="/img/icons.svg#plus"></use></svg>
        <div class="buttons">
          <button type="submit" tabindex="0">Save Column</button>
        </div>`,
      )}
      <button type="button" class="cancel-button" tabindex="0">Cancel</button>
    </div>
    <div data-lol="true" class="spacer"></div>
  </div>
</main>
`;
}
