import type { SessionUser } from "../types";
import { getStoredUser } from "../session";
import { getStore, mockSessionUser } from "../store";
import { STATIC_BARANGAY_ID } from "../staticData";
import type { MockContext } from "./types";
import { handleAuthMock } from "./auth";
import { handleInhabitantsMock } from "./inhabitants";
import { handleDocumentsMock } from "./documents";
import { handleSafetyMock } from "./safety";
import { handleWalletMock } from "./wallet";
import { handleTreasuryMock } from "./treasury";
import { handlePropertiesMock } from "./properties";
import { handleConcernsMock } from "./concerns";
import { handlePortalMock } from "./portal";

export async function mockApiRouter(path: string, opts: RequestInit = {}): Promise<any> {
  const store = getStore();
  const cleanPath = path.split("?")[0];
  const method = opts.method || "GET";
  const queryString = path.includes("?") ? path.split("?")[1] : "";
  const queryParams = new URLSearchParams(queryString);

  const storedOrMock = getStoredUser() || mockSessionUser("kapitan@barangka.gov.ph");
  const currentUser: SessionUser = {
    ...storedOrMock,
    barangayId:
      storedOrMock.barangayId === "brgy-barangka"
        ? STATIC_BARANGAY_ID
        : storedOrMock.barangayId,
  };

  const ctx: MockContext = {
    path,
    cleanPath,
    method,
    opts,
    store,
    currentUser,
    queryParams,
  };

  const res =
    (await handleAuthMock(ctx)) ??
    (await handleInhabitantsMock(ctx)) ??
    (await handleDocumentsMock(ctx)) ??
    (await handleSafetyMock(ctx)) ??
    (await handleWalletMock(ctx)) ??
    (await handleTreasuryMock(ctx)) ??
    (await handlePropertiesMock(ctx)) ??
    (await handleConcernsMock(ctx)) ??
    (await handlePortalMock(ctx));

  if (res !== undefined) {
    return res;
  }

  if (method === "GET") {
    const parts = cleanPath.split("/");
    const targetModel = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1, -1) : "";
    if (store[targetModel]) {
      return store[targetModel];
    }
    return [];
  }

  return {};
}

export * from "./types";
