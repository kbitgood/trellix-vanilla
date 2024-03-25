import Nav from "./Nav.js";

/**
 *
 * @param {Object} [params]
 * @param {boolean} [params.loggedIn=true]
 * @param {string[]} [params.scripts]
 * @param {string} [params.title="Trellix-Vanilla"]
 * @param {string} [params.bodyStyle=""]
 * @param {string} content
 * @returns {string}
 */
export default function Layout(
  {
    loggedIn = true,
    scripts = [],
    title = "Trellix-Vanilla",
    bodyStyle = "",
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
  <body style="${bodyStyle
    .replaceAll(/\n/g, " ")
    .split(";")
    .map((rule) => rule.trim())
    .join(";")}">
    <div class="page-wrapper">
      ${Nav({ loggedIn })}
      ${content}
    </div>
    ${scripts.map((src) => `<script src="${src}" type="module"></script>`).join("\n")}
  </body>
</html>
  `;
}
