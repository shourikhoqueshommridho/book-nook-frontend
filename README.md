This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### BookNook deployment settings

This is the Next.js application. In the Vercel `book-nook-frontend` project,
set **Root Directory** to `book-nook-frontend`, leave the Build Command,
Install Command, and Output Directory at their Next.js defaults, and keep
**Include source files outside the Root Directory** disabled. The checked-in
`vercel.json` in this directory pins the framework to Next.js. Do not point
this project at the repository root or the backend directory. The repository-
root Vercel config skips deployments as a guard against selecting the legacy
backend copy.

Keep the API in a separate Vercel project named `book-nook-backend`, with its
Root Directory set to `book-nook-backend`. Its `vercel.json` deploys the
Express app. The repository-root backend routing has been replaced with a skip
guard so it cannot take over a frontend deployment.

Configure these variables in the Vercel frontend project:

| Variable | Purpose |
| --- | --- |
| `BACKEND_API_URL` | Recommended server-only deployed Express backend base URL. Use the backend origin; a trailing `/api` is also accepted. |
| `NEXT_PUBLIC_API_URL` | Legacy alias for `BACKEND_API_URL`; still accepted so existing Vercel environments keep working. |
| `BETTER_AUTH_URL` | Canonical origin of this deployed frontend. |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth. |
| `MONGODB_URI` | MongoDB connection string used by Better Auth. |
| `MONGODB_DB` | Optional database name; defaults to `book-nook`. |
| `JWT_ISSUER` | Optional JWT issuer; defaults to `booknook`. Must match the backend. |
| `JWT_AUDIENCE` | Optional JWT audience; defaults to `booknook-api`. Must match the backend. |
| `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` | Optional; set both to enable Google sign-in. |

The frontend proxies `/api/books`, `/api/categories`, `/api/uploads`,
`/api/borrows`, and `/api/health` to this backend. Browser requests stay
same-origin; `/api/auth/*` continues to be handled by Better Auth in Next.js.
For local development, the proxy defaults to `http://localhost:5000`.

Set the backend environment separately. It needs `MONGODB_URI`, `JWKS_URL`,
`JWT_ISSUER`, `JWT_AUDIENCE`, and `CORS_ORIGIN`. `JWKS_URL` must point to the
frontend's `/api/auth/jwks` endpoint, and the JWT issuer and audience must match
the frontend. Set `IMGBB_API_KEY` on the backend to enable image uploads.

Set `BACKEND_API_URL` in Production and Preview on the frontend Vercel project
to the backend's HTTPS origin, then redeploy the frontend. For compatibility,
an existing `NEXT_PUBLIC_API_URL` value also works. Vercel builds fail with a
clear configuration error if neither is set. Git pushes remain attached to
each project's fixed Root Directory, so the frontend and backend continue to
deploy independently.
