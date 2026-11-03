
"use client";

import { Toaster as SonnerToaster } from "sonner";

/** Global toast outlet — rendered once in the root layout, styled by sonner. */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      visibleToasts={3}
    />
  );
}
