import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

/** Optional route guard for future routed pages; the existing dashboard remains unchanged. */
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <div role="status">Carregando sessão...</div>;
  if (status !== "authenticated") return fallback ?? <div role="alert">É necessário entrar para acessar esta página.</div>;
  return <>{children}</>;
}
