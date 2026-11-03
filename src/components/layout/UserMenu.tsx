
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOutIcon, UserIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/types/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Authenticated-state profile menu. `signOut()` clears the Better Auth session
 * (HTTP-only cookie + database session), then the navbar re-renders to the
 * logged-out state immediately.
 */
export function UserMenu({
  user,
  onAfterSignOut,
}: {
  user: SessionUser;
  onAfterSignOut?: () => void;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message ?? "Could not sign out. Please try again.");
        return;
      }
      // Invalidate everything cached for this user, then go home.
      router.refresh();
      onAfterSignOut?.();
      router.push("/");
      toast.success("Signed out successfully.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Open user menu"
      >
        <Avatar size="sm">
          {user.image ? (
            <AvatarImage src={user.image} alt={`${user.name}'s avatar`} />
          ) : null}
          <AvatarFallback className="text-[0.65rem] font-semibold">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* Base UI's GroupLabel (DropdownMenuLabel) requires a Menu.Group
          ancestor — hence the DropdownMenuGroup around the profile header. */}
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1.5 py-1.5">
            <div className="flex items-center gap-2.5">
              <Avatar size="lg">
                {user.image ? (
                  <AvatarImage
                    src={user.image}
                    alt={`${user.name}'s avatar`}
                  />
                ) : null}
                <AvatarFallback className="text-sm font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/profile" onClick={() => router.refresh()} />}
        >
          <UserIcon />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          {signingOut ? <Loader2 className="animate-spin" /> : <LogOutIcon />}
          {signingOut ? "Signing out…" : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
