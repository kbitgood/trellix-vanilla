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
    <h1>Goal: Zero Dependancies</h1>
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
    <h1>Tell me what you think</h1>
    <p>If you want to play around, just <a href="/signup">Sign Up</a>. It's free!</p>
    <p>Check out the <a href="https://github.com/kbitgood/trellix-vanilla" target="_blank">source code on github</a>.</p>
    <p>
      Roast me on twitter if I does't live up to Ryan's demo:
      <a href="https://twitter.com/kbitgood" target="_blank">@kbitgood</a>
    </p>
  </article>
</main>
`,
  );
}
