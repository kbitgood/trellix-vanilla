import ActionForm from "./ActionForm.js";

/**
 * @param {{
 *   item: ItemData,
 *   boardId: Pick<BoardData, 'id'>
 * }} props
 * @returns {string}
 */
export default function Item({ item }) {
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
