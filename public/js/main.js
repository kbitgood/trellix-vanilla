import { Board, Column, Item, Home } from "./templates.js";

/****************************************************
 ******************** Utilities *********************
 ****************************************************/
function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild;
}

const offlineChanges = [];

window.onFormSubmit = async function (event) {
  event.preventDefault();
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  let formData = new FormData(form);

  const intent = formData.get("intent");
  if (!intent || typeof window[intent] !== "function") {
    console.error(
      "Form not yet implemented",
      form.action,
      Object.fromEntries(formData.entries()),
    );
    return;
  }

  const { promise, resolve, reject } = Promise.withResolvers();
  const pathname = document.location.pathname;
  const prevState = loadData(pathname);
  window[intent](form, formData, promise);
  if (pathname === document.location.pathname) {
    const nextState = getPageState();
    if (nextState) {
      saveData(pathname, nextState);
    }
  }
  await sendAction({
    action: form.action,
    data: formData,
    prevState,
    resolve,
    reject,
    pathname,
  });
};

async function sendAction(actionData) {
  console.log("sending action", actionData);
  const { action, data, prevState, resolve, reject, pathname } = actionData;

  let formData = data;
  if (!(formData instanceof FormData) && !!data && typeof data === "object") {
    formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.set(key, value);
    }
  }

  if (navigator.onLine) {
    const response = await fetch(action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });
    if (response.ok) {
      resolve(await response.json());
    } else {
      if (prevState) {
        saveData(pathname, prevState);
      }
      reject(await response.json());
    }
  } else {
    console.log("offline, saving action");
    offlineChanges.push(actionData);
  }
}

window.addEventListener("online", async function () {
  console.log("reconnected");
  let actionData;
  while ((actionData = offlineChanges.shift()) && navigator.onLine) {
    console.log(actionData);
    await sendAction(actionData);
  }
});

function generateId() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array(6)
    .fill(0)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

/****************************************************
 ******************** Data Store *******************
 ****************************************************/
const ttl = 1000 * 60 * 60 * 24;
function saveData(key, data) {
  data._lastSavedAt ||= Date.now();
  localStorage.setItem(key, JSON.stringify(data, null, 2));
}
function loadData(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    if (data && data._lastSavedAt > Date.now() - ttl) {
      return data;
    } else {
      localStorage.removeItem(key);
      return null;
    }
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

function deleteData(key) {
  localStorage.removeItem(key);
}

/****************************************************
 **************** Router Functions ******************
 ****************************************************/
window.addEventListener("popstate", function (event) {
  const path = document.location.pathname;
  if (path === "/home") {
    const pageData = loadData(path);
    if (pageData) {
      renderHomePage(pageData);
      event.preventDefault();
      return;
    }
  } else if (path.match(/^\/board\/[0-9a-zA-Z]+$/)) {
    const pageData = loadData(path);
    if (pageData) {
      renderBoardPage(pageData);
      event.preventDefault();
      return;
    }
  }
  window.location.href = document.location.href + "";
});

function onPageLoad() {
  if (document.location.pathname.match(/^\/board\/[0-9a-zA-Z]+$/)) {
    saveData(document.location.pathname, getPageState());
    if (document.querySelectorAll(".column").length === 0) {
      document.querySelector(`form.new-column input[type="text"]`).focus();
    }
  } else if (document.location.pathname === "/home") {
    saveData(document.location.pathname, getPageState());
    document.querySelector("#new-board input[type=text]").focus();
  }
}

document.addEventListener("DOMContentLoaded", onPageLoad);

function renderBoardPage(pageData) {
  const boardEl = htmlToElement(Board(pageData));
  const main = document.querySelector("main");
  main.replaceWith(boardEl);
  document.body.style.backgroundColor = pageData.board.color;
  onPageLoad();
}

function renderHomePage(pageData) {
  const main = document.querySelector("main");
  main.replaceWith(htmlToElement(Home(pageData)));
  document.body.style.backgroundColor = "";
  onPageLoad();
}

window.onBoardCardClick = function (event) {
  if (event.target.closest("form")) return;
  const pageData = loadData(new URL(event.currentTarget.href).pathname);
  if (pageData) {
    event.preventDefault();
    window.history.pushState({}, "", event.currentTarget.href);
    renderBoardPage(pageData);
  }
};

window.onHomeLinkClick = function (event) {
  const pageData = loadData("/home");
  if (pageData) {
    event.preventDefault();
    window.history.pushState({}, "", "/home");
    renderHomePage(pageData);
  }
};

/****************************************************
 **************** Board Functions ******************
 ****************************************************/

window.createBoard = function (form, formData, promise) {
  formData.set("id", generateId());
  const { intent, ...board } = Object.fromEntries(formData.entries());
  const homePageData = loadData("/home");
  homePageData.boards.push(board);
  saveData("/home", homePageData);
  const pageData = { board, columns: [], items: [] };
  saveData(`/board/${board.id}`, pageData);
  window.history.pushState({ board }, "", `/board/${board.id}`);
  renderBoardPage(pageData);
  promise.catch(() => {
    deleteData(`/board/${board.id}`);
    alert("An error occurred while creating the board. Please try again.");
    window.location.href = "/home";
  });
};

function getPageState() {
  if (document.location.pathname.match(/\/board\/[0-9a-zA-Z]+/)) {
    const board = {
      id: document.location.pathname.split("/").pop(),
      name: document
        .querySelector(`form.update-board-name input[name="name"]`)
        .value.trim(),
      color: document.body.style.backgroundColor,
    };
    const columns = [];
    const items = [];
    document.querySelectorAll(".column").forEach((column, index) => {
      columns.push({
        id: column.dataset.id,
        name: column
          .querySelector(`form.update-column-name input[name="name"]`)
          .value.trim(),
        boardId: board.id,
        sortOrder: index + 1,
      });
      column.querySelectorAll(".item").forEach((item, index) => {
        items.push({
          id: item.dataset.id,
          text: item.textContent,
          columnId: column.dataset.id,
          sortOrder: index + 1,
        });
      });
    });
    return { board, columns, items };
  } else if (document.location.pathname === "/home") {
    const boards = [];
    document.querySelectorAll(".board-card").forEach((boardCard) => {
      boards.push({
        id: boardCard.dataset.id,
        name: boardCard.textContent.trim(),
        color: boardCard.style.borderBottomColor,
      });
    });
    return { boards };
  }
  return null;
}

function updateName(form, formData, promise) {
  const input = form.querySelector("input[name=name]");
  const previousName = input.getAttribute("data-previous");
  input.setAttribute("data-previous", input.value);
  input.blur();
  promise.catch(() => {
    input.value = previousName;
    input.setAttribute("data-previous", previousName);
  });
}
window.updateBoardName = updateName;

window.cancelUpdatingName = function (event) {
  const input = event.currentTarget;
  input.value = input.getAttribute("data-previous") ?? "";
};

window.deleteBoard = function (form, _, promise) {
  const boardCard = form.closest(".board-card");
  const parent = boardCard.parentElement;
  const boardData = loadData(`/board/${boardCard.dataset.id}`);
  if (boardData) {
    deleteData(`/board/${boardCard.dataset.id}`);
  }
  boardCard.remove();
  promise.catch(() => {
    saveData(`/board/${boardCard.dataset.id}`, boardData);
    const children = Array.from(parent.children);
    children.push(boardCard);
    parent.append(...children);
  });
};

window.onNewColumnInputFocus = function () {
  const main = document.querySelector("main");
  main.scrollLeft = main.scrollWidth;
};

window.createColumn = function (form, formData, promise) {
  formData.set("id", generateId());
  const column = Object.fromEntries(formData.entries());
  const columnEl = htmlToElement(Column({ column, items: [] }));
  const main = form.closest("main");
  const columnList = main.querySelector(".column-list");
  columnList.append(columnEl);
  main.scrollLeft = main.scrollWidth;
  form.reset();
  promise.catch(() => {
    columnEl.remove();
  });
};

/****************************************************
 **************** Column Functions *****************
 ****************************************************/

window.updateColumnName = updateName;

window.onAddItemKeyDown = function (event) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.currentTarget
      .closest("form")
      .querySelector("button[type=button]")
      .click();
  } else if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.closest("form").requestSubmit();
  }
};

let prevColumnOrder = null;
window.deleteColumn = function (form, _, promise) {
  const columnEl = form.closest(".column");
  const parent = columnEl.parentElement;
  if (!prevColumnOrder) {
    prevColumnOrder = Array.from(parent.children).map((el) => el.dataset.id);
  }
  columnEl.remove();
  promise
    .then(() => {
      prevColumnOrder = Array.from(parent.children).map((el) => el.dataset.id);
    })
    .catch(() => {
      const children = Array.from(parent.children);
      children.push(columnEl);
      children.sort(
        (a, b) =>
          prevColumnOrder.indexOf(a.dataset.id) -
          prevColumnOrder.indexOf(b.dataset.id),
      );
      parent.append(...children);
    });
};

window.createItem = function (form, formData, promise) {
  const boardId = form.action.split("/").pop();
  formData.set("id", generateId());
  const item = Object.fromEntries(formData.entries());
  const itemEl = htmlToElement(Item({ item, boardId }));
  const itemList = form.parentElement?.querySelector(".item-list");
  if (itemList) {
    itemList.append(itemEl);
    itemList.scrollTop = itemList.scrollHeight;
  }
  form.reset();
  promise.catch(() => {
    itemEl.remove();
  });
};

let draggingColumn = null;
let draggingColumnOffset = null;

window.onColumnDragStart = function (event) {
  event.stopPropagation();
  if (draggingColumn) return;
  draggingColumn = event.currentTarget.closest(".column");
  const rect = draggingColumn.getBoundingClientRect();
  draggingColumnOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  window.ondragover = onColumnDragOver;
  window.ondrop = onColumnDrop;
};

function onColumnDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  const prevOver = document.querySelector(
    ".column[data-over-left], .column[data-over-right]",
  );
  if (prevOver) {
    prevOver.removeAttribute("data-over-left");
    prevOver.removeAttribute("data-over-right");
  }
  const elements = Array.from(document.querySelectorAll(".column"));
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (event.clientX < rect.right || element.nextElementSibling === null) {
      const attribute =
        event.clientX < rect.left + rect.width / 2
          ? "data-over-left"
          : "data-over-right";
      element.setAttribute(attribute, "true");
      break;
    }
  }
}

function onColumnDrop(event) {
  event.preventDefault();
  window.ondragover = undefined;
  window.ondrop = undefined;
  if (!draggingColumn) return;

  const prev = draggingColumn;
  const prevParent = draggingColumn.parentElement;
  const prevNextSibling = draggingColumn.nextElementSibling;
  const over = document.querySelector(
    ".column[data-over-left], .column[data-over-right]",
  );
  if (over !== draggingColumn) {
    if (over.hasAttribute("data-over-left")) {
      over.closest(".column-list").insertBefore(draggingColumn, over);
    } else if (over.nextElementSibling) {
      over
        .closest(".column-list")
        .insertBefore(draggingColumn, over.nextElementSibling);
    } else {
      over.closest(".column-list").append(draggingColumn);
    }

    const boardId = document.location.pathname.split("/").pop();
    const formData = new FormData();
    formData.set("intent", "moveColumn");
    formData.set("columnId", draggingColumn.dataset.id);
    formData.set(
      "sortOrder",
      Array.from(document.querySelector(".column-list").children).indexOf(
        draggingColumn,
      ) + 1,
    );

    const { promise, resolve, reject } = Promise.withResolvers();
    const pathname = document.location.pathname;
    const prevState = loadData(pathname);
    if (pathname === document.location.pathname) {
      const nextState = getPageState();
      if (nextState) {
        saveData(pathname, nextState);
      }
    }
    promise.catch(() => {
      if (prevNextSibling) {
        prevParent.insertBefore(prev, prevNextSibling);
      } else {
        prevParent.append(prev);
      }
    });
    void sendAction({
      action: `/board/${boardId}`,
      data: formData,
      prevState,
      resolve,
      reject,
      pathname,
    });
  }

  const newRect = draggingColumn.getBoundingClientRect();
  const x = event.clientX - newRect.left - draggingColumnOffset.x;
  const y = event.clientY - newRect.top - draggingColumnOffset.y;
  draggingColumn.style.transition = "transform 0s";
  draggingColumn.style.transform = `translate(${x}px, ${y}px)`;
  setTimeout(() => {
    draggingColumn.style.transition = "";
    draggingColumn.style.transform = "";
    draggingColumn = null;
  }, 10);

  over.removeAttribute("data-over-left");
  over.removeAttribute("data-over-right");
}

/****************************************************
 ***************** Item Functions *******************
 ****************************************************/

const prevItemOrder = new Map();
window.deleteItem = function (form, _, promise) {
  const itemEl = form.closest(".item");
  const parent = itemEl.parentElement;
  if (!prevItemOrder.has(parent.dataset.id)) {
    prevItemOrder.set(
      parent.dataset.id,
      Array.from(parent.children).map((el) => el.dataset.id),
    );
  }
  itemEl.remove();
  promise
    .then(() => {
      prevItemOrder.set(
        parent.dataset.id,
        Array.from(parent.children).map((el) => el.dataset.id),
      );
    })
    .catch(() => {
      const children = Array.from(parent.children);
      children.push(itemEl);
      children.sort(
        (a, b) =>
          prevItemOrder.get(parent.dataset.id).indexOf(a.dataset.id) -
          prevItemOrder.get(parent.dataset.id).indexOf(b.dataset.id),
      );
      parent.append(...children);
    });
};

let draggingItem = null;
let draggingItemOffset = null;

window.onItemDragStart = function (event) {
  event.stopPropagation();
  if (draggingItem) return;
  draggingItem = event.currentTarget.closest(".item");
  const rect = draggingItem.getBoundingClientRect();
  draggingItemOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  window.ondragover = onItemDragOver;
  window.ondrop = onItemDrop;
};

function onItemDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  const prevOver = document.querySelector(
    ".item[data-over-top], .item[data-over-bottom], .item-list[data-over-top]",
  );
  if (prevOver) {
    prevOver.removeAttribute("data-over-top");
    prevOver.removeAttribute("data-over-bottom");
  }
  for (const listEl of Array.from(document.querySelectorAll(".column"))) {
    const listRect = listEl.getBoundingClientRect();
    if (
      listRect.left < event.clientX &&
      event.clientX < listRect.right &&
      listRect.top < event.clientY &&
      event.clientY < listRect.bottom
    ) {
      const itemEls = Array.from(listEl.querySelectorAll(".item"));
      if (itemEls.length) {
        for (const itemEl of itemEls) {
          const itemRect = itemEl.getBoundingClientRect();
          if (
            event.clientY < itemRect.bottom ||
            itemEl.nextElementSibling === null
          ) {
            const attribute =
              event.clientY < itemRect.top + itemRect.height / 2
                ? "data-over-top"
                : "data-over-bottom";
            itemEl.setAttribute(attribute, "true");
            break;
          }
        }
      } else {
        listEl
          .querySelector(".item-list")
          .setAttribute("data-over-top", "true");
      }
      break;
    }
  }
}

function onItemDrop(event) {
  event.preventDefault();
  window.ondragover = undefined;
  window.ondrop = undefined;
  if (!draggingItem) return;

  const over = document.querySelector(
    ".item[data-over-top], .item[data-over-bottom], .item-list[data-over-top]",
  );
  const prev = draggingItem;
  const prevParent = draggingItem.parentElement;
  const prevNextSibling = draggingItem.nextElementSibling;
  if (over !== draggingItem) {
    if (over.classList.contains("item-list")) {
      over.append(draggingItem);
    } else if (over.hasAttribute("data-over-top")) {
      over.closest(".item-list").insertBefore(draggingItem, over);
    } else if (over.nextElementSibling) {
      over
        .closest(".item-list")
        .insertBefore(draggingItem, over.nextElementSibling);
    } else {
      over.closest(".item-list").append(draggingItem);
    }

    const boardId = document.location.pathname.split("/").pop();
    const formData = new FormData();
    const columnEl = draggingItem.closest(".column");
    formData.set("intent", "moveItem");
    formData.set("itemId", draggingItem.dataset.id);
    formData.set("columnId", over.closest(".column").dataset.id);
    formData.set(
      "sortOrder",
      Array.from(columnEl.querySelector(".item-list").children).indexOf(
        draggingItem,
      ) + 1,
    );

    const { promise, resolve, reject } = Promise.withResolvers();
    const pathname = document.location.pathname;
    const prevState = loadData(pathname);
    if (pathname === document.location.pathname) {
      const nextState = getPageState();
      if (nextState) {
        saveData(pathname, nextState);
      }
    }
    promise.catch(() => {
      if (prevNextSibling) {
        prevParent.insertBefore(prev, prevNextSibling);
      } else {
        prevParent.append(prev);
      }
    });
    void sendAction({
      action: `/board/${boardId}`,
      data: formData,
      prevState,
      resolve,
      reject,
      pathname,
    });
  }

  const newRect = draggingItem.getBoundingClientRect();
  const x = event.clientX - newRect.left - draggingItemOffset.x;
  const y = event.clientY - newRect.top - draggingItemOffset.y;
  draggingItem.style.transition = "transform 0s";
  draggingItem.style.transform = `translate(${x}px, ${y}px)`;
  setTimeout(() => {
    draggingItem.style.transition = "";
    draggingItem.style.transform = "";
    draggingItem = null;
  }, 10);

  over.removeAttribute("data-over-top");
  over.removeAttribute("data-over-bottom");
}
