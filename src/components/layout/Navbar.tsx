
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/types/auth";
import { MenuIcon } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { privateNavLinks, publicNavLinks } from "@/data/site";
import { authClient } from "@/lib/auth-client";
import { cn } from "cn";

function toSessionUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}): SessionUser {
  return { id: user.id, name: user.name, email: user.email, image: user.image };
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Better Auth session — its `useSession` data is null in SSR HTML and on the
  // first client render, then populated from the HTTP-only session cookie, so
  // there is no hydration mismatch. Cookies persist the session across reloads.
  const { data: session, isPending } = authClient.useSession();
  const user: SessionUser | null = session ? toSessionUser(session.user) : null;

  const links = user ? [...publicNavLinks, ...privateNavLinks] : publicNavLinks;

  // Find the most specific matching navigation route.
  const activeLinkHref = [...publicNavLinks, ...privateNavLinks]
    .filter((link) =>
      link.href === "/"
        ? pathname === "/"
        : pathname === link.href ||
          pathname.startsWith(`${link.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isActive = (href: string) => href === activeLinkHref;

  // Separate the private links in the mobile sheet visually.
  const publicLinks = publicNavLinks;
  const privateLinks = user ? privateNavLinks : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive(link.href)
                  ? "text-primary"
                  : "text-foreground/75 hover:text-foreground"
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity",
                  isActive(link.href) ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isPending || user ? (
            user && <UserMenu user={user} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline" })}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "default" })}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>

            <SheetContent side="right" className="w-72 gap-0">
              <SheetHeader>
                <SheetTitle className="font-heading text-lg">
                  Book<span className="text-primary">Nook</span>
                </SheetTitle>
              </SheetHeader>

              <Separator />

              <nav
                className="flex flex-col gap-1 p-3"
                aria-label="Mobile navigation"
              >
                {[...publicLinks, ...privateLinks].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
              </nav>

              <Separator />

              <div className="flex flex-col gap-2 p-4">
                {user ? (
                  <UserMenu
                    user={user}
                    onAfterSignOut={() => {
                      setMenuOpen(false);
                      router.push("/");
                      router.refresh();
                    }}
                  />
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full",
                      })}
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className={buttonVariants({
                        variant: "default",
                        className: "w-full",
                      })}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
