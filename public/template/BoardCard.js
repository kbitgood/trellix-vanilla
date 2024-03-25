/**
 *
 * @param {Object} board
 * @param {number} board.id
 * @param {string} board.name
 * @param {string} board.color
 * @returns string
 * @constructor
 */
export default function BoardCard({ board }) {
  return `
<a href="/board/${board.id}" style="border-color: ${board.color}">
  <div>${board.name}</div>
  <form method="post" action="/board/${board.id}">
    <input type="hidden" name="intent" value="delete" />
    <button type="submit" class="icon-button" aria-label="Delete board">
      <svg><use href="/img/icons.svg#trash"></use></svg>
    </button>
  </form>
</a>
`;
}
