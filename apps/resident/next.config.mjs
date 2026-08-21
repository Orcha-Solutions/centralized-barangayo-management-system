/**
 * @cbms/ui and @cbms/api-client ship raw TS source and import each other with
 * ESM-style ".js" specifiers (e.g. `export * from "./components.js"`).
 * TypeScript resolves those under moduleResolution "Bundler", but webpack does
 * not — `extensionAlias` teaches it to map ".js" back onto the ".ts"/".tsx"
 * source. Fixed here so the shared packages stay untouched.
 */
export default {
  transpilePackages: ["@cbms/ui", "@cbms/api-client"],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};
