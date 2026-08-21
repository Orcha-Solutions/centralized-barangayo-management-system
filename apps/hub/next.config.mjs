/** @type {import("next").NextConfig} */
export default {
  transpilePackages: ["@cbms/ui", "@cbms/api-client"],
  reactStrictMode: true,
  webpack: (config) => {
    // The workspace packages ship TypeScript source and use ESM-style
    // specifiers ("./components.js") that actually point at .ts/.tsx files.
    // TypeScript resolves those; webpack needs to be told to try the TS
    // extensions before giving up.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};
