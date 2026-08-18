import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RoleRoute } from "./app/RoleRoute";
import { RootIndexRoute } from "./app/RootIndexRoute";
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
            {/* "/" ไม่ผ่าน ProtectedRoute อีกต่อไป — index route (RootIndexRoute) เปิดสาธารณะ
                ส่วนเส้นทางย่อยอื่น ๆ ที่ต้องล็อกอินจะครอบด้วย ProtectedRoute เป็นรายเส้นทางแทน */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<RootIndexRoute />} />
              <Route
                path="indicators/:id"
                element={
                  <ProtectedRoute>
                    <IndicatorDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="review-queue"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["qa"]}>
                      <ReviewQueuePage />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="management/users"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["qa"]}>
                      <UsersManagementPage />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="management/indicators"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["qa"]}>
                      <IndicatorsManagementPage />
                    </RoleRoute>
                  </ProtectedRoute>
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
