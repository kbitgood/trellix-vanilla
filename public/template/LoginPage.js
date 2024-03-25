import Layout from "./Layout.js";
import LoginForm from "./LoginForm.js";

export default function LoginPage() {
  return Layout(
    {
      loggedIn: false,
      title: "Log in to Trellix-Vanilla",
    },
    `
<main class="login">
  <article>
    <h1 id="login-header">Log in</h1>
    ${LoginForm({ login: true })}
  </article>
</main>
`,
  );
}
