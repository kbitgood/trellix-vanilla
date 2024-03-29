import Item from "./Item.js";
import ActionForm from "./ActionForm.js";

/**
 * @param {{
 *   column: ColumnData;
 *   items?: ItemData[]
 * }} params
 */
export default function Column({ column, items = [] }) {
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
<!-- placeholder="Enter a title for this card"-->
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
