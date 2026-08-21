/**
 * The workspace packages ship raw TypeScript, so they must be transpiled here.
 *
 * `@cbms/ui/src/index.ts` re-exports with ESM-style extensions
 * (`export * from "./components.js"`) while the files on disk are `.tsx`/`.ts`.
 * TypeScript resolves that fine, webpack does not — hence `extensionAlias`,
 * which is the standard mapping for TS sources written in ESM style.
 * Scoped to this app; nothing in packages/ is modified.
 */
export default {
  transpilePackages: ["@cbms/ui", "@cbms/api-client"],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
};
