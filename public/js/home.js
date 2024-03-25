const boardList = document.querySelector("#boards .board-list");

for (const boardCard of boardList.querySelectorAll("a")) {
  initializeBoardCard(boardCard);
}

/**
 * @param {HTMLElement} boardCard
 */
function initializeBoardCard(boardCard) {
  /** @type {HTMLFormElement} */
  const form = boardCard.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
    });
    if (res.ok) {
      boardCard.remove();
    }
  });
}

async function loadBoards() {
  const [{ default: BoardCard }, boards] = await Promise.all([
    import("../template/BoardCard.js"),
    fetch("/boards", {
      headers: { Accept: "application/json" },
    }).then((res) => (res.ok ? res.json() : null)),
  ]);
  if (boards === null) return null;

  boardList.innerHTML = boards.map((board) => BoardCard({ board })).join("\n");
  for (const boardCard of boardList.querySelectorAll("a")) {
    initializeBoardCard(boardCard);
  }
  isStale = false;
  setTimeout(() => {
    isStale = true;
  }, 5 * 1000);
}

let isStale = false;
setTimeout(() => {
  isStale = true;
}, 5 * 1000);
window.addEventListener("focus", () => {
  if (isStale) {
    void loadBoards();
  }
});
