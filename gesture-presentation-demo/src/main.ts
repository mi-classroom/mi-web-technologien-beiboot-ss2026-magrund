import "./style.css";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const appRoot = document.getElementById("app");

if (!appRoot) {
  throw new Error("Missing root element #app");
}

createRoot(appRoot).render(createElement(App));
