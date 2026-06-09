import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        toastOptions={{
          duration: 3200,
          style: {
            border: "1px solid #d9ead8",
            borderRadius: "10px",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
            color: "#0f172a",
            fontSize: "0.875rem",
            fontWeight: 500,
            maxWidth: "420px",
            padding: "12px 14px",
          },
          success: {
            style: {
              border: "1px solid #b8dfb5",
              background: "#f4fbf3",
            },
            iconTheme: {
              primary: "#359830",
              secondary: "#ffffff",
            },
          },
          error: {
            style: {
              border: "1px solid #fecaca",
              background: "#fff5f5",
            },
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>,
);
