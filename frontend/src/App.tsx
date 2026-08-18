import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { HomeRoute } from "./app/HomeRoute";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RoleRoute } from "./app/RoleRoute";
import { ThemeProvider } from "./app/ThemeProvider";
import { AuthProvider } from "./features/auth/authContext";
import { LoginPage } from "./features/auth/LoginPage";
import { IndicatorDetailPage } from "./features/teacher/IndicatorDetailPage";
import { IndicatorsManagementPage } from "./features/qa/IndicatorsManagementPage";
import { ReviewQueuePage } from "./features/qa/ReviewQueuePage";
import { UsersManagementPage } from "./features/qa/UsersManagementPage";

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
              <Route index element={<HomeRoute />} />
              <Route path="indicators/:id" element={<IndicatorDetailPage />} />
              <Route
                path="review-queue"
                element={
                  <RoleRoute roles={["qa"]}>
                    <ReviewQueuePage />
                  </RoleRoute>
                }
              />
              <Route
                path="management/users"
                element={
                  <RoleRoute roles={["qa"]}>
                    <UsersManagementPage />
                  </RoleRoute>
                }
              />
              <Route
                path="management/indicators"
                element={
                  <RoleRoute roles={["qa"]}>
                    <IndicatorsManagementPage />
                  </RoleRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
