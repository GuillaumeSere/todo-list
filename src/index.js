import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const DATA = [
  {
    id: "todo-0",
    title: "Preparer la semaine",
    notes: "Lister les priorites et bloquer les premiers creneaux.",
    completed: false,
    priority: "high",
    category: "Travail",
    dueDate: "",
  },
  {
    id: "todo-1",
    title: "Relire le budget",
    notes: "Verifier les depenses recurrentes.",
    completed: false,
    priority: "medium",
    category: "Perso",
    dueDate: "",
  },
  {
    id: "todo-2",
    title: "Archiver les notes terminees",
    notes: "",
    completed: true,
    priority: "low",
    category: "Admin",
    dueDate: "",
  },
];

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App tasks={DATA} />
  </React.StrictMode>
);
