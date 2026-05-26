import { supabase } from "@/lib/supabase";
import type { SubAppKey, UserRole } from "@/auth/useCurrentProfile";

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  sub_apps: SubAppKey[];
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  full_name: string;
  password: string;
  sub_apps: SubAppKey[];
  role?: UserRole;
}

export interface UpdateUserInput {
  user_id: string;
  full_name?: string;
  sub_apps?: SubAppKey[];
  role?: UserRole;
}

export type ResetPasswordMode = "temp" | "email";

/**
 * Thin wrapper kolem edge function `admin-users`. Všechny endpointy
 * vyžadují admin role (verify_jwt + uvnitř-function check).
 */
async function invoke<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, ...body },
  });
  if (error) {
    // Error může nést structured `error` field z function body
    const message = error.message || "Admin operation failed.";
    throw new Error(message);
  }
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: string }).error));
  }
  return data as T;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const { users } = await invoke<{ users: AdminUserRow[] }>("list");
  return users;
}

export async function createAdminUser(input: CreateUserInput): Promise<AdminUserRow> {
  const { user } = await invoke<{ user: AdminUserRow }>("create", input as unknown as Record<string, unknown>);
  return user;
}

export async function updateAdminUser(input: UpdateUserInput): Promise<AdminUserRow> {
  const { user } = await invoke<{ user: AdminUserRow }>("update", input as unknown as Record<string, unknown>);
  return user;
}

export async function deleteAdminUser(user_id: string): Promise<void> {
  await invoke<{ ok: true }>("delete", { user_id });
}

export async function resetAdminUserPassword(
  user_id: string,
  mode: ResetPasswordMode = "temp",
): Promise<{ temp_password?: string; sent_to?: string }> {
  return await invoke<{ temp_password?: string; sent_to?: string }>("reset_password", {
    user_id,
    mode,
  });
}
