"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiError, getStoredUser, getToken, type SessionUser } from "@cbms/api-client";
import { translate, type Lang, type TKey } from "@/i18n";

export interface ResidentSession {
  /** True once the token check has run on the client. */
  ready: boolean;
  user: SessionUser | null;
  /** The Inhabitant row this account is linked to — needed to file requests. */
  inhabitantId: string | null;
}

/**
 * Client-side auth gate. The stored token is the source of truth; `api()`
 * already clears the session and bounces to /login on a 401, so we only need
 * to catch the "never signed in" case here.
 */
export function useResidentSession(opts?: { requireAuth?: boolean }): ResidentSession {
  const requireAuth = opts?.requireAuth ?? true;
  const router = useRouter();
  const [state, setState] = React.useState<ResidentSession>({
    ready: false,
    user: null,
    inhabitantId: null,
  });

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      if (requireAuth) {
        router.replace("/login");
        return;
      }
      setState({ ready: true, user: null, inhabitantId: null });
      return;
    }
    const user = getStoredUser();
    setState({ ready: true, user, inhabitantId: user?.inhabitantId ?? null });
  }, [router, requireAuth]);

  return state;
}

/** Turns any thrown value into a message we can safely show a resident. */
export function errorMessage(err: unknown, lang: Lang, fallback: TKey = "error_generic"): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string } | null;
    if (body?.message) return body.message;
    return err.message;
  }
  if (err instanceof TypeError) return translate(lang, "error_offline");
  if (err instanceof Error && err.message) return err.message;
  return translate(lang, fallback);
}

export function apiStatus(err: unknown): number | null {
  return err instanceof ApiError ? err.status : null;
}
