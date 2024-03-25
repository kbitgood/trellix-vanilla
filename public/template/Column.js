import Item from "./Item.js";

/**
 * @param {{
 *   column: Model.Column;
 *   items?: Model.Item[]
 * }} params
 */
export default function Column({ column, items = [] }) {
  return `
<div class="column" data-id="${column.id}">
  <div class="column-header">
    <button class="column-name" aria-label="Edit column &quot;${column.name}&quot; name" type="button">${column.name}</button>
    <form 
      method="post" 
      action="/board/${column.boardId}" 
      class="delete-column"
      onsubmit="onFormSubmit(event)"
    >
      <input type="hidden" name="intent" value="deleteColumn">
      <input type="hidden" name="columnId" value="${column.id}">
      <button aria-label="Delete column" class="icon-button" type="submit">
        <svg><use href="/img/icons.svg#trash"></use></svg>
      </button>
    </form>
  </div>
  <ul class="item-list">
    ${items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => Item({ item, boardId: column.boardId }))
      .join("\n")}
  </ul>
  <button type="button" class="add-item" onclick="showAddItemForm(event)">
    <svg><use href="/img/icons.svg#plus"></use></svg>
    Add a card
  </button>
  <form 
    method="post" 
    action="/board/${column.boardId}" 
    class="new-item" 
    style="display: none;"
    onsubmit="onFormSubmit(event)"
  >
    <input type="hidden" name="intent" value="createItem">
    <input type="hidden" name="id" value="">
    <input type="hidden" name="columnId" value="${column.id}">
    <input type="hidden" name="sortOrder" value="${items.length}">
    <textarea 
      required="" 
      name="text" 
      placeholder="Enter a title for this card"
      onkeydown="onAddItemKeyDown(event)"
    ></textarea>
    <div class="buttons">
      <button type="submit" tabindex="0">Save Card</button>
      <button type="button" tabindex="0" onclick="cancelAddItem(event)">Cancel</button>
    </div>
  </form>
</div>
`;
}
