import Layout from "./Layout.ts";
import type { BoardData } from "../model.ts";
import { Home } from "../../public/js/templates";

export default function HomePage({ boards }: { boards: BoardData[] }) {
  return Layout(
    {
      loggedIn: true,
      scripts: ["/js/main.js", "/js/templates.js"],
      title: "Trellix-Vanilla",
    },
    Home({ boards }),
  );
}
