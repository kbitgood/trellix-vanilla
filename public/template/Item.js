/**
 * @param {Object} params
 * @param {{id:string, text:string}} params.item
 * @param {number} params.boardId
 * @returns {string}
 */
export default function Item({ item, boardId }) {
  return `
<li class="card" data-id="${item.id}">
  <div draggable="true" class="card-content">
    <h3>${item.text}</h3>
    <div class="spacer">&nbsp;</div>
    <form method="post" action="/board/${boardId}">
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
