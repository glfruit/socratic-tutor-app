import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SessionChatPage } from "@/pages/SessionChatPage";
import { SessionsHistoryPage } from "@/pages/SessionsHistoryPage";
import { SubjectsPage } from "@/pages/SubjectsPage";

function ProtectedShell() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return (
    <AppLayout
      onLogout={() => {
        logout();
        navigate("/auth/login", { replace: true });
      }}
    >
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<ProtectedShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/sessions" element={<SessionsHistoryPage />} />
          <Route path="/sessions/:id" element={<SessionChatPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
