import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase/client";
import type { Database } from "../lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "configuration-error" | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  organizationId: string | null;
  branchId: string | null;
  permissions: string[];
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  selectOrganization: (organizationId: string) => Promise<void>;
  selectBranch: (branchId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? "loading" : "configuration-error");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptSession = useCallback(async (session: Session | null) => {
    setErrorMessage(null);
    setUser(session?.user ?? null);
    setOrganizationId(null);
    setBranchId(null);
    setPermissions([]);
    if (!session) {
      setProfile(null);
      setStatus(isSupabaseConfigured ? "unauthenticated" : "configuration-error");
      return;
    }
    try {
      const loadedProfile = await loadProfile(session.user.id);
      setProfile(loadedProfile);
      setStatus("authenticated");
    } catch (error) {
      setProfile(null);
      setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar o perfil.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }
      void acceptSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      if (mounted) void acceptSession(session);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [acceptSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase não está configurado.");
    setStatus("loading");
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error("Supabase não está configurado.");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error("Supabase não está configurado.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) throw new Error("Supabase não está configurado.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const selectOrganization = useCallback(async (nextOrganizationId: string) => {
    if (!supabase || !user) throw new Error("É necessário estar autenticado.");
    const { data, error } = await supabase.from("memberships").select("id").eq("organization_id", nextOrganizationId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Você não possui associação ativa a esta empresa.");
    const { data: assignments, error: assignmentError } = await supabase.from("role_permissions").select("permission_id").eq("role_id", (await supabase.from("memberships").select("role_id").eq("id", data.id).single()).data?.role_id ?? "");
    if (assignmentError) throw assignmentError;
    const permissionIds = (assignments ?? []).map((assignment) => assignment.permission_id);
    let codes: string[] = [];
    if (permissionIds.length > 0) {
      const { data: permissionRows, error: permissionError } = await supabase.from("permissions").select("code").in("id", permissionIds);
      if (permissionError) throw permissionError;
      codes = (permissionRows ?? []).map((permission) => permission.code);
    }
    setOrganizationId(nextOrganizationId);
    setBranchId(null);
    setPermissions(codes);
  }, [user]);

  const selectBranch = useCallback(async (nextBranchId: string) => {
    if (!supabase || !user || !organizationId) throw new Error("Selecione uma empresa antes da filial.");
    const { data: membership, error: membershipError } = await supabase.from("memberships").select("id").eq("organization_id", organizationId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) throw new Error("Associação ativa não encontrada.");
    const { data, error } = await supabase.from("branch_memberships").select("id").eq("organization_id", organizationId).eq("membership_id", membership.id).eq("branch_id", nextBranchId).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Você não possui acesso a esta filial.");
    setBranchId(nextBranchId);
  }, [organizationId, user]);

  const hasPermission = useCallback((permission: string) => permissions.includes(permission), [permissions]);

  const value = useMemo<AuthContextValue>(() => ({
    status, user, profile, organizationId, branchId, permissions, error: errorMessage,
    signIn, signOut, recoverPassword, updatePassword, selectOrganization, selectBranch, hasPermission,
  }), [status, user, profile, organizationId, branchId, permissions, errorMessage, signIn, signOut, recoverPassword, updatePassword, selectOrganization, selectBranch, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
