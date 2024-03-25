import Layout from "./Layout.ts";

export default function SplashPage() {
  return Layout(
    {
      loggedIn: false,
      title: "Welcome to Trellix-Vanilla",
      bodyStyle: `
background-color: rgb(15 23 42);
color: rgb(203 213 225);
`,
    },
    `
<main class="splash">
  <article>
    <p>
      This is a demo app because I couldn't resist trying. This was
      inspired by the
      <a
        href="https://github.com/remix-run/example-trellix"
        target="_blank"
        >Trellix</a>
      demo made by
      <a href="https://twitter.com/ryanflorence" target="_blank">Ryan Florence</a>
      to show off how awesome
      <a href="https://remix.run/" target="_blank">Remix</a>
      is. Remix is awesome. Don't make things like this. Make them with
      Remix.
    </p>
    <p>Obviously.</p>
    <p>
      Just like Ryan's, this is a recreation of the popular drag and drop
      interface in
      <a href="https://trello.com" target="_blank">Trello</a>
      and other similar apps.
    </p>
    <p>If you want to play around, click sign up!</p>
  </article>
  <footer>
    <a href="/signup">Sign up</a>
    <span></span>
    <a href="/login">Login</a>
  </footer>
</main>
`,
  );
}
