import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export interface AuthUser {
  id: number | string; // 1. UBAH DI SINI: Izinkan id berupa number ATAU string
  name: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  avatar?: string | null;
}

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!localStorage.getItem("local_auth_token") && localStorage.getItem("user_role") !== "admin",
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user: AuthUser | null = useMemo(() => {
    const savedRole = localStorage.getItem("user_role");
    const savedToken = localStorage.getItem("local_auth_token");

    if (savedRole === "admin" && savedToken === "simulated-admin-token") {
      return {
        id: "admin-bypass", // Sekarang id string aman digunakan
        name: "LifeMedia Admin",
        email: "admin@lifemedia.id",
        role: "ADMIN",
        avatar: null,
      };
    }

    if (oauthUser) {
      return {
        id: oauthUser.id,
        name: oauthUser.name ?? "User",
        email: oauthUser.email ?? "",
        role: (oauthUser.role as "ADMIN" | "HR" | "EMPLOYEE") ?? "EMPLOYEE",
        avatar: (oauthUser as any).avatar || null, // 2. TAMBAHKAN 'as any' di sini agar tidak protes properti avatar
      };
    }
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        role: localUser.role as "ADMIN" | "HR" | "EMPLOYEE",
        avatar: (localUser as any).avatar || null, // 2. TAMBAHKAN 'as any' di sini juga
      };
    }
    return null;
  }, [oauthUser, localUser]);

  const isSimulatedAdmin = localStorage.getItem("user_role") === "admin";
  const isLoading = isSimulatedAdmin ? false : (oauthLoading || (localLoading && !!localStorage.getItem("local_auth_token")));

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    localStorage.removeItem("user_role");
    document.cookie = "faceabsensi_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      isHR: user?.role === "HR" || user?.role === "ADMIN",
      isLoading,
      logout,
    }),
    [user, isLoading, logout]
  );
}