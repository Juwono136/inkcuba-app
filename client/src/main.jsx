import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* toast host */}
      <Toaster position="top-center"
      toastOptions={{
        duration: 2500,
        style: { fontSize: "0.95rem" },
        success: { iconTheme: { primary: "#16a34a", secondary: "white" } },
        error: { iconTheme: { primary: "#dc2626", secondary: "white" } },
      }} />
    </BrowserRouter>
  </React.StrictMode>
);
