import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { DashboardPage } from "./app/DashboardPage";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { ThemeProvider } from "./app/ThemeProvider";
import { AuthProvider } from "./features/auth/authContext";
import { LoginPage } from "./features/auth/LoginPage";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
