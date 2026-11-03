import Link from "next/link";
import { MailIcon, MapPinIcon } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XLogoIcon,
} from "@/components/layout/BrandIcons";
import { Separator } from "@/components/ui/separator";
import { footerLinks, siteContact } from "@/data/site";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
  { label: "X", href: "https://x.com", Icon: XLogoIcon },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-[#102820] text-[#e8e6da]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Logo variant="cream" />
          <p className="max-w-sm text-sm leading-relaxed text-[#e8e6da]/75">
            BookNook is a cozy online library where you can discover, borrow
            and return great books — and make reading part of your every day.
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`BookNook on ${label}`}
                className="flex size-9 items-center justify-center rounded-full bg-[#f7f4ec]/10 transition-colors hover:bg-[#f7f4ec]/20"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <nav
          className="flex flex-col items-start gap-1 md:justify-self-center"
          aria-label="Footer navigation"
        >
          <h3 className="mb-2 font-heading text-base font-semibold text-[#f7f4ec]">
            Quick Links
          </h3>
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded px-2 py-1.5 text-sm text-[#e8e6da]/75 transition-colors hover:text-[#f7f4ec] hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h3 className="mb-2 font-heading text-base font-semibold text-[#f7f4ec]">
            Contact
          </h3>
          <a
            href={`mailto:${siteContact.email}`}
            className="flex items-center gap-2 text-sm text-[#e8e6da]/75 transition-colors hover:text-[#f7f4ec]"
          >
            <MailIcon className="size-4 shrink-0" aria-hidden="true" />
            {siteContact.email}
          </a>
          <span className="flex items-center gap-2 text-sm text-[#e8e6da]/75">
            <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
            {siteContact.location}
          </span>
        </div>
      </div>

      <Separator className="bg-[#f7f4ec]/15" />
      <p className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-xs text-[#e8e6da]/60 sm:px-6 lg:px-8">
        © 2026 BookNook. All rights reserved.
      </p>
    </footer>
  );
}
