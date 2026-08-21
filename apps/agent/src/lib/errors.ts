import { ApiError } from "@cbms/api-client";

export interface FriendlyError {
  /** Short headline, English. */
  title: string;
  /** What the agent should actually do next. */
  detail: string;
  /** Same guidance in Filipino — most outlet staff read this first. */
  filipino?: string;
  tone: "warn" | "danger";
}

/**
 * Turns an ApiError from POST /wallet/cash-out into counter-ready language.
 * The API answers with 422 + a machine-readable `error` code for the two
 * liquidity failures that actually happen at a counter, plus 404 when the
 * resident has never been onboarded to a wallet.
 */
export function describeCashOutError(err: unknown): FriendlyError {
  if (!(err instanceof ApiError)) {
    return {
      title: "Cannot reach the CBMS server",
      detail:
        "The transaction was NOT recorded. Check your data connection and try again — do not hand over cash until you see a receipt.",
      filipino: "Walang koneksyon. Huwag munang ibigay ang pera hangga't walang resibo.",
      tone: "danger",
    };
  }

  const code = (err.body && typeof err.body === "object" ? err.body.error : null) as
    | string
    | null;
  const serverMessage =
    err.body && typeof err.body === "object" && typeof err.body.message === "string"
      ? (err.body.message as string)
      : null;

  switch (code) {
    case "InsufficientBalance":
      return {
        title: "Resident has not enough e-money",
        detail:
          "Their wallet balance is lower than the amount you entered. Ask them to check their balance, or cash out a smaller amount.",
        filipino: "Kulang ang laman ng e-wallet. Bawasan ang halaga o maghintay ng disbursement.",
        tone: "warn",
      };
    case "AgentOutOfCash":
      return {
        title: "Your outlet is out of cash",
        detail:
          "Your physical cash on hand is below this amount. A liquidity alert has been raised — request a cash rebalance from the LGU hub, and send the resident to another outlet for now.",
        filipino:
          "Kulang ang cash sa kaha. Mag-request ng rebalance sa LGU hub at ituro muna ang resident sa ibang outlet.",
        tone: "danger",
      };
    case "CashOutFailed":
      return {
        title: "The e-money provider declined",
        detail:
          serverMessage ??
          "The EMI rail rejected this cash-out. Nothing was debited. Wait a moment and retry.",
        filipino: "Tinanggihan ng provider. Walang nabawas — subukan ulit maya-maya.",
        tone: "danger",
      };
    case "NotFound":
      return {
        title: "No e-wallet for this resident",
        detail:
          "This resident has not been onboarded to a CBMS e-wallet yet, so there is nothing to cash out. Refer them to the barangay hall for enrolment, or release the aid over the counter.",
        filipino:
          "Wala pang e-wallet ang residenteng ito. Ipaenrol sa barangay hall o ibigay ang ayuda over-the-counter.",
        tone: "warn",
      };
  }

  if (err.status === 403) {
    return {
      title: "Not allowed on this account",
      detail:
        "This login does not carry the wallet:encode permission needed to move money. Sign in with the outlet's agent credential.",
      tone: "danger",
    };
  }
  if (err.status === 404) {
    return {
      title: "Agent or wallet not found",
      detail:
        serverMessage ??
        "Either this outlet or the resident's wallet could not be found. Reload the app and try again.",
      tone: "warn",
    };
  }

  return {
    title: `Cash-out failed (${err.status})`,
    detail: serverMessage ?? "Unexpected error. Nothing was handed over — do not release cash.",
    tone: "danger",
  };
}
