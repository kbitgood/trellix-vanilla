import Nav from "./Nav.ts";

type LayoutOptions = {
  loggedIn?: boolean;
  scripts?: string[];
  title?: string;
  bodyStyle?: string;
};
export default function Layout(
  {
    loggedIn = true,
    scripts = [],
    title = "Trellix-Vanilla",
    bodyStyle = "",
  }: LayoutOptions,
  content: string,
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
    ${scripts
      .map((script) => {
        if (script.trim().startsWith("<script")) {
          return script;
        }
        return `<script src="${script}" type="module"></script>`;
      })
      .join("\n")}
  </body>
</html>
  `;
}
