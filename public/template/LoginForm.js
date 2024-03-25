export default function LoginForm({ login = true }) {
  const signupOrLogin = login ? "login" : "signup";
  return `
<form id="${signupOrLogin}-form" method="post" action="/${signupOrLogin}">
  <div>
    <label for="username">Username</label>
    <input
      id="username"
      name="username"
      aria-describedby="signup-header"
      required=""
    />
  </div>
  <div>
    <label for="password">Password</label>
    <input
      id="password"
      name="password"
      type="password"
      autocomplete="current-password"
      aria-describedby="password-error"
      required=""
    />
  </div>
  <span class="form-error" style="display: none"></span>
  <button type="submit">Sign in</button>
  <div class="sub-submit">
    ${
      login
        ? `Don't have an account? <a href="/signup">Sign up</a>.`
        : `Already have an account? <a href="/login">Log in</a>.`
    }
  </div>
</form>
`;
}
