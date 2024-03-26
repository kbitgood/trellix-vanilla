import BoardCard from "./BoardCard.js";

export default function Home({ boards }) {
  return `
<main class="home">
<form id="new-board" method="post" action="/boards" onsubmit="onFormSubmit(event)">
  <input type="hidden" name="intent" value="createBoard">
  <h2>New Board</h2>
  <label for="name">Name</label>
  <input
    name="name"
    type="text"
    required
    id="name"
    style="margin-top: 0.5rem"
  />
  <div class="form-row">
    <label for="board-color">Color</label
    ><input
      id="board-color"
      name="color"
      type="color"
      value="#cbd5e1"
    />
    <button type="submit" style="margin-left: 0.75rem; flex-grow: 1">
      Create
    </button>
  </div>
  <span class="form-error" style="display: none"></span>
</form>
<section id="boards">
  <h2>Boards</h2>
  <div class="board-list">
    ${boards.map((board) => BoardCard({ board: board })).join("\n")}
  </div>
</section>
</main>
`;
}
