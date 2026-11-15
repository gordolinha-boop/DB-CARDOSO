import type { AuthError, Session } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local.");
  }
  return supabase;
}

export function toAuthMessage(error: AuthError | Error): string {
  if (error.message.includes("Invalid login credentials")) return "E-mail ou senha inválidos.";
  if (error.message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (error.message.includes("too many requests")) return "Muitas tentativas. Aguarde e tente novamente.";
  return error.message || "Não foi possível concluir a operação de autenticação.";
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error("A autenticação não retornou uma sessão válida.");
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/auth/reset-password`;
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updateRecoveredPassword(password: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}
