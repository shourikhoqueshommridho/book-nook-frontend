
import type { Metadata } from "next";

import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/layout/Toaster";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookNook — A Cozy Online Library",
  description:
    "Discover beautiful books, borrow your favorites, and make reading part of your everyday life.",
};

const themeInitScript = `
try {
  const theme = localStorage.getItem("booknook-theme");

  if (
    theme === "dark" ||
    (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Runs the theme decision before paint to avoid a light-mode flash.
            eslint-disable-next-line react/no-danger -- inline string is a
            build-time constant; never takes user input. */}
        <script
          id="theme-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />

        <Navbar />

        <TooltipProvider>
          {children}
        </TooltipProvider>

        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
