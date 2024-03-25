import Layout from "./Layout.js";
import BoardCard from "./BoardCard.js";

/**
 * @param {Object} params
 * @param {Array<{id:number, name:string, color:string}>} params.boards
 * @returns {string}
 */
export default function HomePage({ boards }) {
  return Layout(
    {
      loggedIn: true,
      scripts: ["/js/home.js"],
      title: "Trellix-Vanilla",
    },
    `
<main class="home">
<form id="new-board" method="post" action="/boards">
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
    ${boards.map((board) => BoardCard({ board })).join("\n")}
  </div>
</section>
</main>
`,
  );
}
