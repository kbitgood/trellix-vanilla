/**
 * @param {{ boards: BoardData[] }} props
 * @return {string}
 */
export function Home({ boards }) {
  return `
<main class="home">
<form id="new-board" method="post" action="/boards" onsubmit="onFormSubmit(event)">
  <input type="hidden" name="intent" value="createBoard">
  <h2>New Board</h2>
  <label for="name">Name</label>
  <input
    name="name"
    type="text"
    required
    id="name"
    style="margin-top: 0.5rem"
    autocomplete="off"
  />
  <div class="form-row">
    <label for="board-color">Color</label
    ><input
      id="board-color"
      name="color"
      type="color"
      value="#cbd5e1"
    />
    <button type="submit" style="margin-left: 0.75rem; flex-grow: 1">
      Create
    </button>
  </div>
  <span class="form-error" style="display: none"></span>
</form>
<section id="boards">
  <h2>Boards</h2>
  <div class="board-list">
    ${boards.map((board) => BoardCard({ board: board })).join("\n")}
  </div>
</section>
</main>
`;
}

/**
 * @param {{
 *   board: BoardData
 * }} props
 * @return {string}
 */
export function BoardCard({ board }) {
  return `
<a 
  class="board-card" 
  href="/board/${board.id}" 
  data-id="${board.id}" 
  style="border-color: ${board.color}"
  onclick="onBoardCardClick(event)"
>
  <div>${board.name}</div>
  <form method="post" action="/board/${board.id}" class="delete-board" onsubmit="onFormSubmit(event)">
    <input type="hidden" name="intent" value="deleteBoard" />
    <button type="submit" class="icon-button" aria-label="Delete board">
      <svg><use href="/img/icons.svg#trash"></use></svg>
    </button>
  </form>
</a>
`;
}

/**
 * @param {{
 *   board: BoardData,
 *   columns: ColumnData[],
 *   items: ItemData[]
 * }} props
 * @return {string}
 */
export function Board({ board, columns, items }) {
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
        data-previous="${board.name}"
        onblur="cancelUpdatingName(event)"
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

/**
 * @param {{
 *   column: ColumnData;
 *   items?: ItemData[]
 * }} props
 * @return {string}
 */
export function Column({ column, items = [] }) {
  return `
<div class="column" data-id="${column.id}">
  <div class="column-content" draggable="true" ondrag="onColumnDragStart(event)">
    <div class="column-header">
      ${ActionForm(
        {
          className: "update-column-name",
          intent: "updateColumnName",
          data: { columnId: column.id },
        },
        `<input 
          required="" 
          type="text" 
          aria-label="Edit column name" 
          name="name" 
          value="${column.name}"
          autocomplete="off"
          data-previous="${column.name}"
          onblur="cancelUpdatingName(event)"
        >`,
      )}
      ${ActionForm(
        {
          className: "delete-column",
          intent: "deleteColumn",
          data: { columnId: column.id },
        },
        `<button aria-label="Delete column" class="icon-button" type="submit">
            <svg><use href="/img/icons.svg#trash"></use></svg>
          </button>`,
      )}
    </div>
    <ul class="item-list">
      ${items
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => Item({ item, boardId: column.boardId }))
        .join("\n")}
    </ul>
    ${ActionForm(
      {
        className: "new-item",
        intent: "createItem",
        data: { columnId: column.id },
      },
      `<textarea 
        required="" 
        name="text" 
        placeholder="Enter a title for this card"
        onkeydown="onAddItemKeyDown(event)"
      ></textarea>
      <div class="add-item-button">
        <svg><use href="/img/icons.svg#plus"></use></svg>
        Add a card
      </div>
      <div class="buttons">
        <button type="submit" tabindex="0">Save Card</button>
      </div>`,
    )}
    <button class="cancel-button" type="button">Cancel</button>
  </div>
</div>
`;
}

/**
 * @param {{
 *   item: ItemData,
 *   boardId: Pick<BoardData, 'id'>
 * }} props
 * @return {string}
 */
export function Item({ item }) {
  return `
<li class="item" data-id="${item.id}">
  <div draggable="true" class="item-content" ondrag="onItemDragStart(event)">
    <h3>${item.text}</h3>
    <div class="spacer">&nbsp;</div>
    ${ActionForm(
      { intent: "deleteItem", data: { itemId: item.id } },
      `<button aria-label="Delete card" class="icon-button" type="submit">
        <svg>
          <use href="/img/icons.svg#trash"></use>
        </svg>
      </button>`,
    )}
  </div>
</li>
`;
}

/**
 * @param {{
 *   className?: string;
 *   intent: string;
 *   data?: Record<string, string|number>;
 * }} props
 * @param {string} [children]
 * @returns {string}
 */
export function ActionForm({ className, intent, data }, children) {
  return `
<form 
  ${className ? `class="${className}"` : ""}
  method="post"
  onsubmit="onFormSubmit(event)"
>
  <input type="hidden" name="intent" value="${intent}">
  ${Object.entries(data || {})
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${name}" value="${value}">`,
    )
    .join("")}
  ${children || ""}
</form>
`;
}
