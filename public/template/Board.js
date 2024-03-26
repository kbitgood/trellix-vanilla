import Column from "./Column.js";

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
    <button
      class="board-name"
      aria-label="Edit board &quot;${board.name}&quot; name"
      type="button"
      onclick="showUpdateBoardNameForm(event)"
    >${board.name}</button>
    <form
      method="post"
      action="/board/${board.id}"
      class="update-board-name"
      onsubmit="onFormSubmit(event)"
      style="display: none;"
    >
      <input type="hidden" name="intent" value="updateBoardName">
      <input type="hidden" name="id" value="${board.id}">
      <input
        required=""
        type="text"
        aria-label="Edit board name"
        name="name"
        value="${board.name}"
        autocomplete="off"
      >
    </form>
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
    <button aria-label="Add new column" class="add-column" onclick="showAddColumnForm(event)">
      <svg><use href="/img/icons.svg#plus"></use></svg>
    </button>
    <form 
      method="post" 
      action="/board/${board.id}" 
      class="new-column"
      style="display: none;"
      onsubmit="onFormSubmit(event)"
    >
      <input type="hidden" name="intent" value="createColumn">
      <input type="hidden" name="id" value="">
      <input type="hidden" name="boardId" value="${board.id}">
      <input required="" type="text" name="name">
      <div class="buttons flex justify-between">
        <button type="submit" tabindex="0">Save Column</button>
        <button type="button" class="cancel" tabindex="0" onclick="cancelAddColumn(event)">Cancel</button>
      </div>
    </form>
    <div data-lol="true" class="spacer"></div>
  </div>
</main>
`;
}
