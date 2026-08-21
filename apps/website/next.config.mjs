/**
 * The workspace packages ship raw TypeScript source, so they must be
 * transpiled by this app.
 *
 * They also use NodeNext-style specifiers internally (`export * from
 * "./components.js"` pointing at `components.tsx`). TypeScript resolves that
 * fine, but webpack does not unless we teach it the same `.js` -> `.ts(x)`
 * mapping — hence `resolve.extensionAlias`.
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
};
