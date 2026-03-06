import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";

export const useAuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMemo(() => ({ isAuthenticated }), [isAuthenticated]);
};
