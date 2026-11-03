"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export async function getBackendToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/token", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) return null;

    const body = (await response.json()) as { token?: string };

    return body.token ?? null;
  } catch {
    return null;
  }
}