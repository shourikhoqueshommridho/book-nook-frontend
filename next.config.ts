import type { NextConfig } from "next";

const configuredBackendUrl =
  process.env.BACKEND_API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
const isProductionBuild = process.env.NODE_ENV === "production";

if ((process.env.VERCEL === "1" || isProductionBuild) && !configuredBackendUrl) {
  throw new Error(
    "Set BACKEND_API_URL (or NEXT_PUBLIC_API_URL) in the frontend environment to enable the Express API proxy."
  );
}

let backendUrl: URL;
try {
  backendUrl = new URL(configuredBackendUrl || "http://localhost:5000");
} catch {
  throw new Error(
    "BACKEND_API_URL must be an absolute URL, such as https://book-nook-backend.vercel.app."
  );
}

if (backendUrl.protocol !== "http:" && backendUrl.protocol !== "https:") {
  throw new Error("BACKEND_API_URL must use http or https.");
}
if (process.env.VERCEL === "1" && backendUrl.protocol !== "https:") {
  throw new Error("BACKEND_API_URL must use HTTPS in Vercel deployments.");
}
if (backendUrl.search || backendUrl.hash) {
  throw new Error("BACKEND_API_URL must not include a query string or fragment.");
}

const backendPath = backendUrl.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
const backendApiBase = `${backendUrl.origin}${backendPath}/api`;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Book covers are stored as URLs in MongoDB (any user-provided host).
    // Both protocols are allowed because Add Book accepts http(s) URLs.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    const resources = ["books", "categories", "uploads", "borrows"];

    return [
      ...resources.flatMap((resource) => [
        {
          source: `/api/${resource}`,
          destination: `${backendApiBase}/${resource}`,
        },
        {
          source: `/api/${resource}/:path*`,
          destination: `${backendApiBase}/${resource}/:path*`,
        },
      ]),
      {
        source: "/api/health",
        destination: `${backendApiBase}/health`,
      },
    ];
  },
};

export default nextConfig;
