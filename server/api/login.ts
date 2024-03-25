import { createUser, loginUser, userExists } from "../db.ts";
import { createRoute } from "./index.ts";
import { createCookie } from "../cookie.ts";
import { BadRequestError } from "../Error.ts";

const handler = async function (req: Request) {
  const formData = Object.fromEntries((await req.formData()).entries());
  if (!validateFormData(formData)) {
    throw new BadRequestError("Invalid form data");
  }
  const { username, password } = formData;

  if (new URL(req.url).pathname === "/api/signup") {
    if (userExists(username)) {
      throw new BadRequestError(
        "An account with this username already exists.",
      );
    }
    createUser(username, password);
  }

  const { token, expiresAt } = loginUser(username, password);
  const response = Response.json({ token, expiresAt });
  response.headers.append(
    "Set-Cookie",
    createCookie("session", token, {
      expires: new Date(expiresAt),
      httpOnly: false,
    }),
  );
  return response;
};

function validateFormData(
  formData: unknown,
): formData is { username: string; password: string } {
  return (
    typeof formData === "object" &&
    formData !== null &&
    "username" in formData &&
    typeof formData.username === "string" &&
    "password" in formData &&
    typeof formData.password === "string"
  );
}

// noinspection JSUnusedGlobalSymbols
export default [
  createRoute({
    method: "POST",
    path: "/api/signup",
    handler: handler,
  }),
  createRoute({
    method: "POST",
    path: "/api/login",
    handler: handler,
  }),
];
