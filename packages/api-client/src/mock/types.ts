import type { SessionUser } from "../types";

export interface MockContext {
  path: string;
  cleanPath: string;
  method: string;
  opts: RequestInit;
  store: Record<string, any[]>;
  currentUser: SessionUser;
  queryParams: URLSearchParams;
}
