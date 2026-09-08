import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../won-banking-style.mockup.css";
import "./styles/transactions.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
