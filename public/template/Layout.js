import Nav from "./Nav.js";

/**
 *
 * @param {Object} [params]
 * @param {boolean} [params.loggedIn=true]
 * @param {string[]} [params.scripts]
 * @param {string} [params.title="Trellix-Vanilla"]
 * @param {boolean} [params.darkBackground=false]
 * @param {string} content
 * @returns {string}
 */
export default function Layout(
  {
    loggedIn = true,
    scripts = [],
    title = "Trellix-Vanilla",
    darkBackground = false,
  } = {},
  content,
) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <link href="/css/reset.css" rel="stylesheet" />
    <link href="/css/style.css" rel="stylesheet" />
  </head>
  <body ${darkBackground ? `class="dark-bg"` : ""}>
    <div class="page-wrapper">
      ${Nav({ loggedIn })}
      ${content}
    </div>
    ${scripts.map((src) => `<script src="${src}"></script>`).join("\n")}
  </body>
</html>
  `;
}
