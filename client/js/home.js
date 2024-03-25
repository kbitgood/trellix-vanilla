const form = document.getElementById("new-board");
const formError = form.querySelector(".form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const res = await fetch(`/api/boards`, {
    method: "POST",
    body: data,
  });
  const responseData = await res.json();
  const valid = res.ok && validateBoardData(responseData);
  if (res.ok && valid) {
    formError.style.display = "none";
    document.location = "/board/" + responseData.id;
  } else {
    formError.style.display = "";
    formError.textContent =
      responseData?.error ??
      (valid ? "Unknown error" : "Invalid data received from the server");
  }
});

function validateBoardData(data) {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "number" &&
    typeof data.name === "string" &&
    typeof data.color === "string"
  );
}

async function loadBoards() {
  const res = await fetch("/api/boards");
  if (!res.ok) return null;
  /** @type {Array<{ id: number, name: string, color: string }>} */
  const boards = await res.json();

  const boardList = document.querySelector("#boards .board-list");
  boardList.innerHTML = "";

  for (const board of boards) {
    const boardElement = document.createElement("a");
    boardElement.href = `/board/${board.id}`;
    boardElement.style.borderColor = board.color;
    boardElement.innerHTML = `<div>${board.name}</div>`;
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Delete board");
    button.innerHTML = `<svg><use href="/img/icons.svg#trash"></use></svg>`;
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const res = await fetch(`/api/boards/${board.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        boardElement.remove();
      }
    });
    boardElement.appendChild(button);
    boardList.appendChild(boardElement);
  }
}

loadBoards();
