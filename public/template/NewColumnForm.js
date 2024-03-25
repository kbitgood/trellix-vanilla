/**
 * @param {Object} params
 * @param {number} params.boardId
 * @returns {string}
 */
export default function NewColumnForm({ boardId }) {
  return `
<form method="post" action="/board/${boardId}" class="new-column">
  <input type="hidden" name="intent" value="createColumn">
  <input required="" type="text" name="name">
  <div class="buttons flex justify-between">
    <button type="submit" tabindex="0" class="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue">Save Column</button>
    <button type="button" tabindex="0" class="text-sm rounded-lg text-left p-2 font-medium hover:bg-slate-200 focus:bg-slate-200">Cancel</button>
  </div>
</form>
`;
}
