import { ApiError } from "../types";
import { clearSession, getStoredUser, getToken, setSession } from "../session";
import { mockSessionUser } from "../store";
import type { MockContext } from "./types";

export function handleAuthMock(ctx: MockContext): any {
  const { cleanPath, method, opts, store } = ctx;

  if (cleanPath === "/auth/login" && method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const email = body.email || "";
    let targetEmail = email;
    if (!targetEmail && typeof window !== "undefined") {
      const port = window.location.port;
      if (port === "4101") targetEmail = "resident1@example.ph";
      else if (port === "4102") targetEmail = "lgu@marikina.gov.ph";
      else if (port === "4103") targetEmail = "treasurer@barangka.gov.ph";
      else targetEmail = "kapitan@barangka.gov.ph";
    }
    const user = mockSessionUser(targetEmail);
    setSession("mock-token", user);
    return { token: "mock-token", user };
  }

  if (cleanPath === "/auth/me" && method === "GET") {
    const token = getToken();
    if (!token) {
      throw new ApiError(401, { message: "Unauthorized: No token provided" });
    }
    const storedUser = getStoredUser();
    if (!storedUser?.email) {
      throw new ApiError(401, { message: "Unauthorized: No active user session" });
    }
    const refreshed = mockSessionUser(storedUser.email);
    setSession(token, refreshed);
    return { user: refreshed };
  }

  if (cleanPath === "/auth/logout" && method === "POST") {
    clearSession();
    return {};
  }

  if (cleanPath === "/health" && method === "GET") {
    return {
      status: "ok",
      service: "cbms-api-mock",
      uptimeSec: 9999,
      timestamp: new Date().toISOString(),
    };
  }

  if (cleanPath === "/public/barangays" && method === "GET") {
    return store.Barangay || [];
  }

  return undefined;
}
