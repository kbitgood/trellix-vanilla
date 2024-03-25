/**
 * @param {Object} params
 * @param {number} params.boardId
 * @param {string} params.columnId
 * @param {number} params.sortOrder
 * @returns {string}
 * @constructor
 */
export default function NewItemForm({ boardId, columnId, sortOrder }) {
  return `
<form method="post" action="/board/${boardId}" class="new-item">
  <input type="hidden" name="intent" value="createItem">
  <input type="hidden" name="columnId" value="${columnId}">
  <input type="hidden" name="sortOrder" value="${sortOrder}">
  <textarea required="" name="text" placeholder="Enter a title for this card"></textarea>
  <div class="buttons">
    <button type="submit" tabindex="0">Save Card</button>
    <button type="button" tabindex="0">Cancel</button>
  </div>
</form>
`;
}
