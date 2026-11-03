
/**
 * Surfaces Better Auth OAuth failure codes to the user.
 *
 * Why the raw code needs unmasking: our pages set their own
 * `errorCallbackURL` as `/login|register?error=google&redirect=…`, and Better
 * Auth *appends* its machine-readable code onto that URL without parsing the
 * existing pairs (see @better-auth/core/utils/url.appendQueryParams). The
 * result is a DUPLICATE `error` key:
 *
 *   /register?error=google&redirect=%2F&error=account_not_linked
 *
 * `searchParams.get("error")` only sees the first value ("google"), so the
 * real reason was silently discarded before this helper existed.
 */

/**
 * Friendly copy for Better Auth's OAuth callback error codes
 * (node_modules/better-auth/dist/oauth2/errors.mjs → OAUTH_CALLBACK_ERROR_CODES
 * plus the state/validation codes produced by dist/api/routes/callback.mjs).
 * Values shown to users never include tokens, codes or internal details.
 */
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "An account with this email already exists but isn't linked to Google yet. Sign in with your email and password instead.",
  email_does_not_match:
    "The Google account you tried to use is linked to a different email address.",
  unable_to_link_account:
    "Google sign-in is temporarily unable to connect your accounts. Please try again or sign in with your email and password.",
  account_already_linked_to_different_user:
    "This Google account is already connected to a different user.",
  email_not_verified:
    "Your email could not be verified by Google. Please try again.",
  email_not_found:
    "Your Google account doesn't share an email address, so we can't sign you in.",
  unable_to_get_user_info:
    "We couldn't read your Google profile. Please try again.",
  invalid_code: "Google sign-in didn't complete. Please try again.",
  no_code: "Google sign-in was cancelled before completing. Please try again.",
  access_denied: "Google sign-in was cancelled. Please try again.",
  invalid_callback_request: "Google sign-in returned an invalid response. Please try again.",
  state_not_found: "Google sign-in expired while signing you in. Please try again.",
  state_mismatch: "Google sign-in expired while signing you in. Please try again.",
  state_invalid: "Google sign-in session was invalid. Please try again.",
  nonce_binding_missing: "Google sign-in expired while signing you in. Please try again.",
  oauth_provider_not_found:
    "Google sign-in isn't configured for this app. Please contact the site owner.",
  issuer_missing: "Google sign-in returned an unexpected response. Please try again.",
  issuer_mismatch: "Google sign-in returned an unexpected response. Please try again.",
};

export interface OAuthErrorInfo {
  /** The machine-readable Better Auth code, if identifiable. */
  code: string | null;
  /** User-facing message — never contains secrets, tokens or codes. */
  message: string;
}

/**
 * Reads every `error` query value and returns the real OAuth code: our own
 * sentinel ("google") is ignored so the LAST appended Better Auth code wins.
 * When Better Auth wasn't the source (e.g. a bare `?error=google` from a
 * user-cancelled redirect, or Google's own raw failure text) we degrade to a
 * generic, non-technical message.
 */
export function readOAuthError(errorValues: string[]): OAuthErrorInfo {
  const realCode =
    [...errorValues].reverse().find((value) => !isInternalSentinel(value)) ??
    null;

  if (!realCode) {
    return {
      code: null,
      message: "Google sign-up/sign-in didn't complete. Please try again.",
    };
  }

  const mapped = OAUTH_ERROR_MESSAGES[realCode];
  if (mapped) {
    return { code: realCode, message: mapped };
  }
  return {
    code: realCode,
    message: "Google sign-up/sign-in didn't complete. Please try again.",
  };
}

function isInternalSentinel(value: string): boolean {
  return value === "google" || value.toLowerCase() === "oauth";
}
