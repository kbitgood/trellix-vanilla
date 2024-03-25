import Column from "../template/Column.js";
import NewColumnForm from "../template/NewColumnForm.js";
import NewItemForm from "../template/NewItemForm.js";
import Item from "../template/Item.js";

const boardId = parseInt(document.location.pathname.split("/").pop());

const main = document.querySelector("main");
const columnList = document.querySelector(".columns");
const addColumnButton = columnList.querySelector(".add-column");

/**
 * @returns {HTMLFormElement}
 */
function renderNewColumnForm() {
  const element = document.createElement("div");
  element.innerHTML = NewColumnForm({ boardId });
  return element.firstElementChild;
}

addColumnButton.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const form = renderNewColumnForm();
  columnList.insertBefore(form, addColumnButton);
  initializeNewColumnForm(form);
  addColumnButton.style.display = "none";
});

const columns = columnList.querySelectorAll(".column");
if (columns.length) {
  columns.forEach(initializeNewColumn);
} else {
  addColumnButton.click();
}

/**
 * @param {HTMLFormElement} form
 * @param {boolean} [focus=true]
 */
function initializeNewColumnForm(form, focus = true) {
  const nameInput = form.querySelector('input[name="name"]');
  const cancelButton = form.querySelector('button[type="button"]');

  let submittingWithEnter = false;

  if (focus) {
    nameInput.focus();
    main.scrollLeft = main.scrollWidth;
  } else {
    form.focus();
  }

  /** @param {KeyboardEvent} e */
  const onNameInputKeydown = (e) => {
    if (e.key === "Escape") {
      removeForm();
    } else if (e.key === "Enter") {
      submittingWithEnter = true;
      form.requestSubmit();
    }
  };

  /** @param {SubmitEvent} e */
  const onFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const id = crypto.randomUUID();
    const formData = new FormData(form);
    formData.set("id", id);
    /** @type {Object} */
    const column = Object.fromEntries(formData.entries());
    column.boardId = boardId;

    const element = document.createElement("div");
    element.innerHTML = Column({ column });
    const columnElement = element.querySelector(".column");
    columnList.insertBefore(columnElement, form);
    initializeNewColumn(columnElement);

    removeForm();
    if (submittingWithEnter) {
      setTimeout(() => {
        const newForm = renderNewColumnForm();
        columnList.insertBefore(newForm, addColumnButton);
        initializeNewColumnForm(newForm, submittingWithEnter);
      }, 0);
    }

    // todo rollback on failure
    await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
  };

  /** @param {FocusEvent} e */
  const onFormFocusOut = (e) => {
    if (!form.contains(e.relatedTarget)) {
      removeForm();
    }
  };

  /** @param {MouseEvent} e */
  const onCancelButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeForm();
  };

  const removeForm = () => {
    form.removeEventListener("focusout", onFormFocusOut);
    form.removeEventListener("submit", onFormSubmit);
    cancelButton.removeEventListener("click", onCancelButtonClick);
    nameInput.removeEventListener("keydown", onNameInputKeydown);
    form.remove();
    addColumnButton.style.display = "";
  };

  form.addEventListener("focusout", onFormFocusOut);
  form.addEventListener("submit", onFormSubmit);
  cancelButton.addEventListener("click", onCancelButtonClick);
  nameInput.addEventListener("keydown", onNameInputKeydown);
}

/** @param {HTMLDivElement} column */
function initializeNewColumn(column) {
  const columnId = column.dataset.id;
  /** @type {HTMLFormElement} */
  const deleteColumnForm = column.querySelector("form.delete-column");
  const addItemContainer = column.querySelector(".add-card");
  const addItemButton = addItemContainer.querySelector("button");
  const items = column.querySelectorAll(".card-list .card");
  items.forEach(initializeItem);
  /** @param {SubmitEvent} e */
  const onDeleteColumnFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteColumnForm.removeEventListener("submit", onDeleteColumnFormSubmit);
    addItemButton.removeEventListener("click", onAddItemButtonClick);
    column.remove();

    // todo rollback on failure
    await fetch(deleteColumnForm.action, {
      method: "POST",
      body: new FormData(deleteColumnForm),
      headers: { Accept: "application/json" },
    });
  };

  const onAddItemButtonClick = () => {
    const form = renderNewItemForm(columnId);
    column.insertBefore(form, addItemContainer);
    initializeNewItemForm(form);
    addItemContainer.style.display = "none";
  };

  addItemButton.addEventListener("click", onAddItemButtonClick);
  deleteColumnForm.addEventListener("submit", onDeleteColumnFormSubmit);
}

/**
 * @param {string} columnId
 * @returns {Element}
 */
function renderNewItemForm(columnId) {
  const column = columnList.querySelector(`.column[data-id="${columnId}"]`);
  const sortOrder = column.querySelectorAll(".card").length + 1;
  const element = document.createElement("div");
  element.innerHTML = NewItemForm({ columnId, boardId, sortOrder });
  return element.firstElementChild;
}

/**
 * @param {HTMLFormElement} form
 * @param {boolean} [focus=true]
 */
function initializeNewItemForm(form, focus = true) {
  const nameInput = form.querySelector("textarea");
  const cancelButton = form.querySelector('button[type="button"]');
  const column = form.parentElement;
  const itemList = column.querySelector(".card-list");
  const addItemContainer = column.querySelector(".add-card");

  let submittingWithEnter = false;

  if (focus) {
    nameInput.focus();
    itemList.scrollTop = itemList.scrollHeight;
  } else {
    form.focus();
  }

  /** @param {KeyboardEvent} e */
  const onNameInputKeydown = (e) => {
    if (e.key === "Escape") {
      removeForm();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      submittingWithEnter = true;
      form.requestSubmit();
    }
  };

  /** @param {SubmitEvent} e */
  const onFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const id = crypto.randomUUID();
    const formData = new FormData(form);
    formData.set("id", id);
    /** @type {Object} */
    const item = Object.fromEntries(formData.entries());
    item.boardId = boardId;

    const element = document.createElement("div");
    element.innerHTML = Item({ item, boardId });
    const itemElement = element.querySelector("li");
    itemList.appendChild(itemElement);
    initializeItem(itemElement);

    removeForm();
    if (submittingWithEnter) {
      const newForm = renderNewItemForm(item.columnId);
      column.insertBefore(newForm, addItemContainer);
      initializeNewItemForm(newForm, submittingWithEnter);
      addItemContainer.style.display = "none";
    } else {
      addItemContainer.style.display = "";
    }

    // todo rollback on failure
    await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
  };

  /** @param {FocusEvent} e */
  const onFormFocusOut = (e) => {
    if (!form.contains(e.relatedTarget)) {
      removeForm();
    }
  };

  /** @param {MouseEvent} e */
  const onCancelButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeForm();
  };

  const removeForm = () => {
    form.removeEventListener("focusout", onFormFocusOut);
    form.removeEventListener("submit", onFormSubmit);
    cancelButton.removeEventListener("click", onCancelButtonClick);
    nameInput.removeEventListener("keydown", onNameInputKeydown);
    form.remove();
    addItemContainer.style.display = "";
  };

  form.addEventListener("focusout", onFormFocusOut);
  form.addEventListener("submit", onFormSubmit);
  cancelButton.addEventListener("click", onCancelButtonClick);
  nameInput.addEventListener("keydown", onNameInputKeydown);
}

/**
 * @param {HTMLLIElement} item
 */
function initializeItem(item) {
  const form = item.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    item.remove();
    // todo rollback on failure
    await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
  });
}
