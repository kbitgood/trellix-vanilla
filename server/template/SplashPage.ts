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
  <div class="sign-in-buttons">
    <a href="/signup">Sign up</a>
    <span></span>
    <a href="/login">Login</a>
  </div>
  <article>
    <h1>Welcome to Trellix Vanilla</h1>
    <p>
      This is a demo app because I couldn't resist trying. I saw the challenge
      that
      <a href="https://x.com/remix_run/status/1747711520510038035?s=20" target="_blank">Ryan Florence</a>
      put out for other framework authors, or anyone, to remake his
      <a href="https://github.com/remix-run/example-trellix">Trellix</a> demo
      (inspired by Trello) and see if they can make it better than
      <a href="https://remix.run/" rel="nofollow">Remix</a>. No one was making
      anything quite as Ryan's demo (or at least enough to get an A from him).
      So I picked up the challenge.
    </p>
    <p>Other Trellix Demos:</p>
    <ul>
      <li>
        NextJS -
        <a
          href="https://x.com/ryanflorence/status/1765179463497892117?s=20"
          target="_blank"
          >Ryan's reaction</a
        >
      </li>
      <li>
        <a
          href="https://github.com/Rich-Harris/sveltekit-movies-demo"
          target="_blank"
          >Svelte</a
        >
        -
        <a
          href="https://x.com/ryanflorence/status/1766124524444250124?s=20"
          target="_blank"
          >Ryan's reaction</a
        >
      </li>
      <li>
        <a href="https://github.com/tkdodo/trellix-query" target="_blank"
          >Tanstack</a
        >
        -
        <a
          href="https://x.com/ryanflorence/status/1767245924299071718?s=20"
          target="_blank"
          >Ryan's reaction</a
        >
      </li>
      <li>
        <a href="https://github.com/vimtor/trellix-replicache" target="_blank"
          >Replicache</a
        >
        -
        <a
          href="https://x.com/ryanflorence/status/1767656588360421454?s=20"
          target="_blank"
          >Ryan's reaction</a
        >
      </li>
    </ul>
    <h2>Goal: Zero Dependancies</h2>
    <p>
      I am not a framework author, so the goal with this demo is to see if I can
      make it without a framework. One further, I thought I could make it
      without a build step. I wanted to see if I could do this with zero
      dependancies. Not even tailwind!
    </p>
    <p>
      And I did it. There are zero (production) dependancies. Just development
      dependancies for typescript for the bun server, and prettier because I'm
      not a mad man.
    </p>
    <p>
      I used <a href="https://bun.sh/" target="_blank">bun</a> for my backend
      and only used the built in APIs. Admittedly this is kind of cheating since
      it has a lot built in, including SQLite. So maybe this would be better
      called Trellix-Bun ¯\\_(ツ)_/¯
    </p>
    <p>
      One final note: Remix is awesome. Don't make things like this. Make them
      with Remix.
    </p>
    <p>Obviously.</p>
    <h2>Tell me what you think</h2>
    <p>If you want to play around, click sign up above!</p>
    <p>
      Roast me on twitter if I does't live up to Ryan's demo:
      <a href="https://twitter.com/kbitgood" target="_blank">@kbitgood</a>
    </p>
  </article>
</main>
`,
  );
}
