import Column from "../template/Column.js";
import Item from "../template/Item.js";

/****************************************************
 ******************** Utilities *********************
 ****************************************************/
function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild;
}

window.onFormSubmit = function (event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const intent = form.intent.value;
  if (intent && typeof window[intent] === "function") {
    event.preventDefault();
    let formData = new FormData(form);
    const modifiedFormData = window[intent](form);
    if (modifiedFormData instanceof FormData) {
      formData = modifiedFormData;
    }
    void fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });
  } else {
    event.preventDefault();
    console.error(
      "Form not yet implemented",
      form.method,
      form.action,
      Object.fromEntries(new FormData(form).entries()),
    );
  }
};

function onFormFocusOut(event) {
  const form = event.currentTarget;
  if (!form.contains(event.relatedTarget)) {
    hideForm(form);
  }
}
function hideForm(form) {
  const button = form.previousElementSibling;
  button.style.display = "";
  form.style.display = "none";
  form.reset();
  form.removeEventListener("focusout", onFormFocusOut);
}

function onShowFormButtonClick(event) {
  const button = event.currentTarget;
  const form = button.nextElementSibling;
  button.style.display = "none";
  form.style.display = "";
  const input = form.querySelector("input[type=text], textarea");
  input.focus();
  input.select();
  form.addEventListener("focusout", onFormFocusOut);
}

/****************************************************
 **************** Board Functions ******************
 ****************************************************/

window.showUpdateBoardNameForm = function (event) {
  const button = event.currentTarget;
  const form = button.nextElementSibling;
  form.name.value = button.textContent;
  onShowFormButtonClick(event);
};

window.updateBoardName = function (form) {
  const name = form.name.value;
  const button = form.previousElementSibling;
  button.textContent = name;
  button.focus();
  hideForm(form);
};

window.deleteBoard = function (form) {
  form.closest(".board-card").remove();
};

window.showAddColumnForm = function (event) {
  onShowFormButtonClick(event);
  const main = document.querySelector("main");
  main.scrollLeft = main.scrollWidth;
};
window.cancelAddColumn = function (event) {
  hideForm(event.currentTarget.closest("form"));
};

window.createColumn = function (form) {
  const formData = new FormData(form);
  formData.set("id", crypto.randomUUID());
  const column = Object.fromEntries(formData.entries());
  const columnEl = htmlToElement(Column({ column, items: [] }));
  const main = form.closest("main");
  const columnList = main.querySelector(".column-list");
  columnList.append(columnEl);
  main.scrollLeft = main.scrollWidth;
  form.reset();
  return formData;
};

/****************************************************
 **************** Column Functions *****************
 ****************************************************/

window.showUpdateColumnNameForm = function (event) {
  const button = event.currentTarget;
  const form = button.nextElementSibling;
  form.name.value = button.textContent;
  onShowFormButtonClick(event);
};

window.updateColumnName = function (form) {
  const name = form.name.value;
  const button = form.previousElementSibling;
  button.textContent = name;
  button.focus();
  hideForm(form);
};

window.showAddItemForm = onShowFormButtonClick;

window.cancelAddItem = function (event) {
  hideForm(event.currentTarget?.closest("form"));
};

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

window.deleteColumn = function (form) {
  const columnEl = form.closest(".column");
  columnEl.remove();
};

window.createItem = function (form) {
  const boardId = Number(form.action.split("/").pop());
  const formData = new FormData(form);
  formData.set("id", crypto.randomUUID());
  const item = Object.fromEntries(formData.entries());
  const itemEl = htmlToElement(Item({ item, boardId }));
  const itemList = form.parentElement?.querySelector(".item-list");
  if (itemList) {
    itemList.append(itemEl);
    itemList.scrollTop = itemList.scrollHeight;
  }
  form.reset();
  return formData;
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

    const boardId = Number(document.location.pathname.split("/").pop());
    const formData = new FormData();
    formData.set("intent", "moveColumn");
    formData.set("columnId", draggingColumn.dataset.id);
    formData.set(
      "sortOrder",
      Array.from(document.querySelector(".column-list").children).indexOf(
        draggingColumn,
      ) + 1,
    );
    void fetch(`/board/${boardId}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
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

window.deleteItem = function (form) {
  const itemEl = form.closest(".item");
  itemEl.remove();
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

    const boardId = Number(document.location.pathname.split("/").pop());
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
    void fetch(`/board/${boardId}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
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

/****************************************************
 ***************** initialization *******************
 ****************************************************/
if (document.location.pathname.match(/\/board\/\d+/)) {
  if (document.querySelectorAll(".column").length === 0) {
    document.querySelector(".add-column").click();
  }
}
