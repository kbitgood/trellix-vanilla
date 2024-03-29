/**
 *
 * @param {{
 *   className?: string;
 *   intent: string;
 *   data?: Record<string, string|number>;
 * }} props
 * @param {string} [children]
 * @returns {string}
 */
export default function ActionForm({ className, intent, data }, children) {
  return `
<form 
  ${className ? `class="${className}"` : ""}
  method="post"
  onsubmit="onFormSubmit(event)"
>
  <input type="hidden" name="intent" value="${intent}">
  ${Object.entries(data || {})
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${name}" value="${value}">`,
    )
    .join("")}
  ${children || ""}
</form>
`;
}
