import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { AuthProvider } from "./features/auth/AuthContext.jsx";
import { ThemeProvider } from "./features/theme/ThemeContext.jsx";
import { NotificationProvider } from "./features/notifications/NotificationContext.jsx";

import { ToastProvider } from "./components/ui/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
