export default function Nav({ loggedIn }: { loggedIn: boolean }) {
  return `
<nav>
  <a class="logo" href="${loggedIn ? "/home" : "/"}" id="home-link">
    <div>Trellix-Vanilla</div>
    <div>a Stupid Demo</div>
  </a>
  <div class="links">
    <a href="https://github.com/kbitgood/trellix-vanilla">
      <img src="/img/github-mark-white.png" aria-hidden="true" />
      <span>Source</span>
    </a>
  </div>
  ${
    loggedIn
      ? `
    <div class="links" id="login-link">
      <a href="/logout">
        <svg><use href="/img/icons.svg#logout"></use></svg>
        <span>Log out</span>
      </a>
    </div>
  `
      : `
    <div class="links" id="login-link">
      <a href="/login">
        <svg><use href="/img/icons.svg#login"></use></svg>
        <span>Log in</span>
      </a>
    </div>
  `
  }
</nav>
  `;
}
