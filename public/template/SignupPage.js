import Layout from "./Layout.js";
import LoginForm from "./LoginForm.js";

export default function SignupPage() {
  return Layout(
    {
      loggedIn: false,
      title: "Sign up for Trellix-Vanilla",
    },
    `
<main class="login">
  <article>
    <h1 id="signup-header">Sign up</h1>
    ${LoginForm({ login: false })}
    <h2>Privacy Notice</h2>
    <p>
      This won't be used for anything besides this stupid little demo app.
      You just need to be able to log in so that you can see your boards
      and no one else's. But common sense rules still apply. Don't put any
      personally identifiable information in here. Don't reuse passwords.
      Etc.
    </p>
    <p>
      Note: you don't even have to use your email to log in. Just some
      random username.
    </p>
    <h2>Terms of Service</h2>
    <p>
      This is a demo app, there are no terms of service. Don't be
      surprised if your data disappears.
    </p>
  </article>
</main>
`,
  );
}
