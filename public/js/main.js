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

/** @param {SubmitEvent} event */
window.onFormSubmit = function (event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const intent = form.intent.value;
  if (intent && typeof window[intent] === "function") {
    event.preventDefault();
    let formData = window[intent](form);
    if (!(formData instanceof FormData)) {
      formData = new FormData(form);
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

/****************************************************
 **************** Board Functions ******************
 ****************************************************/

window.deleteBoard = function (form) {
  form.closest(".board-card").remove();
};

window.showAddColumnForm = function (event) {
  /** @type {HTMLButtonElement} */
  const button = event.currentTarget;
  const form = button.nextElementSibling;
  button.style.display = "none";
  form.style.display = "";
  form.querySelector("input[type=text]").focus();
  form.addEventListener("focusout", onFormFocusOut);
};

function onFormFocusOut(event) {
  /** @type {HTMLFormElement} */
  const form = event.currentTarget;
  if (!form.contains(event.relatedTarget)) {
    form.querySelector("button.cancel")?.click();
  }
}

/** @param {PointerEvent} event */
window.cancelAddColumn = function (event) {
  /** @type {HTMLFormElement} */
  const form = event.currentTarget?.closest("form");
  const button = event.currentTarget
    .closest("main")
    .querySelector(".add-column");
  form.style.display = "none";
  button.style.display = "";
  form.removeEventListener("focusout", onFormFocusOut);
};

window.createColumn = function (form) {
  const formData = new FormData(form);
  formData.set("id", crypto.randomUUID());
  formData.set(
    "sortOrder",
    form.closest(".columns").querySelectorAll(".column").length,
  );
  const column = Object.fromEntries(formData.entries());
  const columnEl = htmlToElement(Column({ column, items: [] }));
  const main = form.closest("main");
  const columnList = main.querySelector(".column-list");
  columnList.append(columnEl);
  main.scrollLeft = main.scrollWidth;
  form.reset();
  return formData;
};

/** @param {KeyboardEvent} event */
window.onAddColumnKeyDown = function (event) {};

/****************************************************
 **************** Column Functions *****************
 ****************************************************/
/** @param {PointerEvent} event */
window.showAddItemForm = function (event) {
  const button = event.currentTarget;
  const form = button.closest(".column").querySelector("form.new-item");
  form.style.display = "";
  button.style.display = "none";
  form.querySelector("textarea")?.focus();
  form.addEventListener("focusout", onFocusOut);
};

function onFocusOut(event) {
  /** @type {HTMLFormElement} */
  const form = event.currentTarget;
  if (!form.contains(event.relatedTarget)) {
    form.querySelector("button[type=button]")?.click();
  }
}

/** @param {PointerEvent} event */
window.cancelAddItem = function (event) {
  /** @type {HTMLFormElement} */
  const form = event.currentTarget?.closest("form");
  const button = form.previousElementSibling;
  form.style.display = "none";
  button.style.display = "";
  form.removeEventListener("focusout", onFocusOut);
};

/** @param {KeyboardEvent} event */
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

/**
 * @param {HTMLFormElement} form
 */
window.deleteColumn = function (form) {
  const columnEl = form.closest(".column");
  columnEl.remove();
};

/**
 * @param {HTMLFormElement} form
 */
window.createItem = function (form) {
  const boardId = Number(form.action.split("/").pop());
  const formData = new FormData(form);
  formData.set("id", crypto.randomUUID());
  formData.set(
    "sortOrder",
    form.closest(".column").querySelectorAll(".item").length,
  );
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

/****************************************************
 ***************** Item Functions *******************
 ****************************************************/

window.deleteItem = function (form) {
  const itemEl = form.closest(".item");
  itemEl.remove();
};

/****************************************************
 ***************** initialization *******************
 ****************************************************/
if (document.location.pathname.match(/\/board\/\d+/)) {
  if (document.querySelectorAll(".column").length === 0) {
    document.querySelector(".add-column").click();
  }
}
