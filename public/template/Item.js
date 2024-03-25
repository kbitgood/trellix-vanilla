/**
 * @param {{
 *   item: Model.Item,
 *   boardId: Pick<Model.Board, 'id'>
 * }} props
 * @returns {string}
 */
export default function Item({ item, boardId }) {
  return `
<li class="item" data-id="${item.id}">
  <div draggable="true" class="item-content" ondrag="onItemDragStart(event)">
    <h3>${item.text}</h3>
    <div class="spacer">&nbsp;</div>
    <form 
      method="post" 
      action="/board/${boardId}"
      onsubmit="onFormSubmit(event)"
    >
      <input type="hidden" name="intent" value="deleteItem"/>
      <input type="hidden" name="itemId" value="${item.id}"/>
      <button aria-label="Delete card" class="icon-button" type="submit">
        <svg>
          <use href="/img/icons.svg#trash"></use>
        </svg>
      </button>
    </form>
  </div>
</li>
`;
}
