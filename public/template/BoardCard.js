/**
 *
 * @param {{
 *   board: Model.Board
 * }} params
 * @returns string
 */
export default function BoardCard({ board }) {
  return `
<a class="board-card" href="/board/${board.id}" data-id="${board.id}" style="border-color: ${board.color}">
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
