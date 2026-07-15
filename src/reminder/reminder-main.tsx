import React from "react";
import ReactDOM from "react-dom/client";
import { ReminderApp } from "./ReminderApp";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderApp />
  </React.StrictMode>,
);
