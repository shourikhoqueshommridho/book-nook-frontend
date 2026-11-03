<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# book-nook-frontend

Next.js 16.4.3 App Router frontend (`src/app`), React 19, TypeScript strict, Tailwind v4. Currently a scaffold — no test runner, no CI, no backend/API integration yet. Don't invent test or API commands that don't exist.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run lint` — ESLint only; there is no lint-staged/CI wrapper
- `npx next typegen && npx tsc --noEmit` — typecheck. Route types like `LayoutProps<"/">` (used in `src/app/layout.tsx`) are generated into `.next/types` and `.next/dev/types` (see `tsconfig.json` include); if typecheck fails on missing types, generate them first.

## Non-default `next.config.ts` flags

- `cacheComponents: true` — dynamic data access has different caching/Suspense rules than stock Next; check the cacheComponents guide in `node_modules/next/dist/docs/`
- `reactCompiler: true` — React Compiler is enabled; do not add `useMemo`/`useCallback`/`memo` workarounds
- Tailwind v4 is loaded via a `turbopack.rules` loader on `*.css` (there is no `postcss.config.js`). Don't remove that block — CSS silently breaks without it. Theme tokens live in `@theme inline` in `src/app/globals.css`.

## Conventions

- Path alias `@/*` → `./src/*`
- ESLint uses flat config in `eslint.config.mjs`; extra ignores go in its `globalIgnores`, not a `.eslintignore` file
- npm is the package manager (`package-lock.json` only)
- shadcn here is the Base UI flavor (`@base-ui/react`, style `base-nova`), NOT Radix: component APIs differ (e.g. `use client` + `render` prop instead of `asChild`)
- Do NOT do `Button render={<Link/>}` (+`nativeButton={false}`): Base UI's render merge of a Next `Link` client ref produces different elements in SSR vs hydration (`role="button"` vs `type="button"`) — a React hydration mismatch error. Instead style plain `<Link>` with `buttonVariants({variant, size, className})` from `@/components/ui/button` (seeNavbar/BookCard). `render={<Button/>}` inside a Base UI trigger is fine (both real buttons)
- `npx shadcn add ...` can silently reset `src/app/globals.css` to 3 bare `@import` lines (in this repo the theme lives in globals.css, the package ships only variants) — check the file after running it
- React-compiler-era ESLint rejects `setState` inside `useEffect`; use `useSyncExternalStore` for DOM-derived state (see ThemeToggle)

## Known traps (cost debugging time)

- Next 16 `cacheComponents` prerender rejects `new Date()` anywhere at render time — including inside third-party client components. Swiper needed a `<Suspense>` boundary in `page.tsx` for this reason; same treatment applies to any clock/`Math.random()`-reading component
- lucide-react 1.65+ ships NO brand icons (Facebook/Instagram/LinkedIn/X) — use `src/components/layout/BrandIcons.tsx`

