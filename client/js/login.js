const loginOrSignup = document.location.pathname.startsWith("/login")
  ? "login"
  : "signup";

const form = document.getElementById(`${loginOrSignup}-form`);
const formError = form.querySelector(".form-error");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const res = await fetch(`/api/${loginOrSignup}`, {
    method: "POST",
    body: data,
  });
  if (res.ok) {
    document.location = "/home";
  } else {
    formError.style.display = "";
    formError.textContent = (await res.json())?.error || "Unknown error";
  }
});
