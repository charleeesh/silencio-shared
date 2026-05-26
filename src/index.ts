/**
 * silencio-shared — sdílený design system pro Silencio Finance Hub ekosystém.
 *
 * Importy:
 *   import { AppShell, MetricCard } from "silencio-shared";
 *   import "silencio-shared/tokens.css";
 */

// Components
export { AppShell } from "@/components/AppShell";
export { SpotlightCard } from "@/components/SpotlightCard";
export { MetricCard } from "@/components/MetricCard";
export { PageHeader } from "@/components/PageHeader";
export { PrimaryButton } from "@/components/PrimaryButton";
export { UserMenu } from "@/components/UserMenu";
export { ChangePasswordModal } from "@/components/ChangePasswordModal";

// Theme
export { ThemeProvider, useTheme, useThemePreference } from "@/theme/ThemeProvider";
export { ThemeToggle } from "@/theme/ThemeToggle";
export {
  applyTheme,
  fetchThemePreference,
  persistThemePreference,
  readCachedTheme,
  writeCachedTheme,
  type ThemePreference,
} from "@/theme/api";

// Auth — api & hooks
export {
  signInWithPassword,
  signOut,
  requestPasswordReset,
  updatePassword,
} from "@/auth/api";
export { useSession, useAuth, type UseSessionResult } from "@/auth/useSession";
export {
  useCurrentProfile,
  type CurrentProfile,
  type UseCurrentProfileResult,
  type UserRole,
  type SubAppKey,
} from "@/auth/useCurrentProfile";
export { RequireAuth, RedirectIfAuthed, AuthRoute } from "@/auth/RequireAuth";
export {
  mapAuthError,
  type AuthFailure,
  type AuthFailureCode,
} from "@/auth/errors";

// Auth — building-block components
export { AuthLayout } from "@/auth/components/AuthLayout";
export { AuthHeading } from "@/auth/components/AuthHeading";
export { AuthLink } from "@/auth/components/AuthLink";
export { FormError } from "@/auth/components/FormError";
export { Logo as AuthLogo } from "@/auth/components/Logo";
export { UnderlineInput } from "@/auth/components/UnderlineInput";
export { PasswordInput } from "@/auth/components/PasswordInput";

// Auth — full pages
export { LoginPage } from "@/auth/pages/LoginPage";
export { ForgotPasswordPage } from "@/auth/pages/ForgotPasswordPage";
export { SetNewPasswordPage } from "@/auth/pages/SetNewPasswordPage";
export { ExpiredLinkPage } from "@/auth/pages/ExpiredLinkPage";

// Admin
export { AdminUsersPage } from "@/admin/AdminUsersPage";
export {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  resetAdminUserPassword,
  type AdminUserRow,
  type CreateUserInput,
  type UpdateUserInput,
  type ResetPasswordMode,
} from "@/admin/adminApi";

// Chips
export { NeutralChip } from "@/chips/NeutralChip";
export { SignalChip } from "@/chips/SignalChip";
export { BrandChip } from "@/chips/BrandChip";

// Lib
export { cn } from "@/lib/cn";
export {
  HUB_HOME_URL,
  getCurrentSubApp,
  type SubApp,
} from "@/lib/constants";
export { supabase, setSupabaseClient } from "@/lib/supabase";
