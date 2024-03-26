import Layout from "./Layout.ts";
import type { BoardData } from "../model.ts";
import Home from "../../public/template/Home";

export default function HomePage({ boards }: { boards: BoardData[] }) {
  return Layout(
    {
      loggedIn: true,
      scripts: ["/js/main.js"],
      title: "Trellix-Vanilla",
    },
    Home({ boards }),
  );
}
