
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
  isPasswordValid,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/lib/password-validation";

/**
 * Better Auth lives in the Next.js app (assignment requirement) and talks to
 * the same MongoDB Atlas cluster as the Express API, in the "user", "session",
 * "account", "verification" and "jwks" collections of the "book-nook" database.
 * A module-level singleton so hot reloads / serverless invocations reuse the
 * client instead of opening a new connection per request.
 */
let mongoClient: MongoClient | null = null;

function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to the frontend .env.local (used by Better Auth)."
    );
  }
  if (!mongoClient) {
    // The driver connects lazily on the first operation — no explicit
    // connect() needed; the Db instance can be handed to the adapter in sync.
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  }
  return mongoClient;
}

function getAuthDb() {
  return getMongoClient().db(process.env.MONGODB_DB ?? "book-nook");
}

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  // getBaseAdapter calls this factory once with the resolved options.
  database: mongodbAdapter(getAuthDb(), { client: getMongoClient() }),
  /** Falls back to the BETTER_AUTH_URL env var; on Vercel set it there. */
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const body = ctx.body as Record<string, unknown> | undefined;
      const password = body?.password;
      if (typeof password !== "string" || !isPasswordValid(password)) {
        throw new APIError("BAD_REQUEST", {
          message: PASSWORD_REQUIREMENTS_MESSAGE,
        });
      }
    }),
  },
  account: {
    accountLinking: {
      /**
       * This app has NO email-verification flow (no `sendVerificationEmail`),
       * so every email/password user stays emailVerified: false. This Better
       * Auth build defaults `requireLocalEmailVerified` to true, which made
       * implicit same-email Google linking permanently impossible: the
       * callback failed with `account_not_linked` and bounced back to
       * /register?error=… (that was the real "Sign up with Google" failure).
       *
       * Setting this to false restores the documented Better Auth linking
       * contract: link only when the *provider* confirms the email is
       * verified (Google always does — `email_verified: true`) and the
       * emails match exactly. `allowDifferentEmails` stays false and the
       * unsafe force-linking escape hatch (trustedProviders) is NOT used.
       */
      requireLocalEmailVerified: false,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: googleConfigured,
    },
  },
  plugins: [
    /**
     * JWT plugin: Express verifies these tokens against the JWKS endpoint
     * served at GET /api/auth/jwks (see backend src/auth.js).
     */
    jwt({
      jwt: {
        issuer: process.env.JWT_ISSUER ?? "booknook",
        audience: process.env.JWT_AUDIENCE ?? "booknook-api",
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          name: user.name,
          email: user.email,
          image: user.image,
        }),
      },
    }),
    // Required so sign-in / sign-out set cookies from server actions in Next.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

/**
 * Data Access Layer helper for Server Components.
 * Returns the full session ({ session, user }) or null.
 */
export async function getServerSession(): Promise<Session | null> {
  return auth.api.getSession({ headers: await headers() });
}
