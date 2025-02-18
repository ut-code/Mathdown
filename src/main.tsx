import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import App from "./App.tsx";
import App_1 from "./App_1.tsx";
import AppRouter from "./AppRouters.tsx";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
