import Item from "./Item.js";

/**
 *
 * @param {Object} params
 * @param {{id:string, name: string, boardId:number}} params.column
 * @param {Array<{id:string, text: string, sortOrder:number}>} [params.items]
 * @constructor
 */
export default function Column({ column, items = [] }) {
  return `
<div class="column" data-id="${column.id}">
  <div class="column-header">
    <button aria-label="Edit column &quot;${column.name}&quot; name" type="button">${column.name}</button>
    <form method="post" action="/board/${column.boardId}" class="delete-column">
      <input type="hidden" name="intent" value="deleteColumn">
      <input type="hidden" name="columnId" value="${column.id}">
      <button aria-label="Delete column" class="icon-button" type="submit">
        <svg><use href="/img/icons.svg#trash"></use></svg>
      </button>
    </form>
  </div>
  <ul class="card-list">
    ${items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => Item({ item, boardId: column.boardId }))
      .join("\n")}
  </ul>
  <div class="add-card">
    <button type="button">
      <svg><use href="/img/icons.svg#plus"></use></svg>
      Add a card
    </button>
  </div>
</div>
`;
}
