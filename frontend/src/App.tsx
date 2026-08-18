import type { Location } from "react-router-dom";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { NotFoundPage } from "./app/NotFoundPage";
import { IndicatorDrawerRoute } from "./app/IndicatorDrawerRoute";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RoleRoute } from "./app/RoleRoute";
import { RootIndexRoute } from "./app/RootIndexRoute";
import { ThemeProvider } from "./app/ThemeProvider";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthProvider } from "./features/auth/authContext";
import { AccountPage } from "./features/auth/AccountPage";
import { LoginPage } from "./features/auth/LoginPage";
import { IndicatorDetailPage } from "./features/teacher/IndicatorDetailPage";
import { IndicatorsManagementPage } from "./features/qa/IndicatorsManagementPage";
import { ReviewQueuePage } from "./features/qa/ReviewQueuePage";
import { UsersManagementPage } from "./features/qa/UsersManagementPage";

interface NavigationState {
  backgroundLocation?: Location;
}

// ครอบด้วยคอมโพเนนต์แยกเพราะต้องใช้ useLocation ซึ่งต้องอยู่ใต้ BrowserRouter
function AppRoutes() {
  const location = useLocation();
  // "background location" pattern (react-router v6): เมื่อเปิด /indicators/:id จากการคลิกแถวในรายการ
  // (ดู MyWorkPage/DashboardPage) เราจะ navigate มาที่เส้นทางนี้พร้อม state.backgroundLocation = หน้าที่เปิดอยู่เดิม
  // จากนั้น Routes หลักยังคง render หน้าพื้นหลังนั้นต่อไป ส่วน route /indicators/:id ตัวจริงจะ render เป็น
  // แผงเลื่อน (Drawer) ลอยทับอยู่ด้านบนแทน — แต่ถ้าเข้าเส้นทางนี้ตรง ๆ (ลิงก์ตรง/รีเฟรชหน้า ไม่มี state)
  // จะ fallback ไปเป็นหน้าเต็มจอ (IndicatorDetailPage) ตามปกติ
  const backgroundLocation = (location.state as NavigationState | null)?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
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
            path="account"
            element={
              <ProtectedRoute>
                <AccountPage />
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
          {/* เส้นทางที่ไม่รู้จัก — แสดงหน้า 404 ภายใน AppLayout เพื่อให้ยังมีเมนูให้กลับไปหน้าอื่นได้ */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/indicators/:id"
            element={
              <ProtectedRoute>
                <IndicatorDrawerRoute />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
