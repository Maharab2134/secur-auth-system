import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const savedTheme =
  typeof window !== "undefined"
    ? window.localStorage.getItem("authnova-theme") || "dark"
    : "dark";

if (typeof document !== "undefined") {
  document.documentElement.classList.remove("theme-light", "theme-dark");
  document.documentElement.classList.add(
    savedTheme === "light" ? "theme-light" : "theme-dark",
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
