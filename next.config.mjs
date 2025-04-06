let userConfig = undefined;

try {
  // try to import ESM first
  userConfig = await import("./v0-user-next.config.mjs");
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    // Add updated key if needed in your user config
    // serverExternalPackages: ["some-package"],
  },
};

// Merge user config into base config
if (userConfig) {
  const config = userConfig.default || userConfig;

  for (const key in config) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      };
    } else {
      nextConfig[key] = config[key];
    }
  }

  // Fix deprecated keys if userConfig has them
  if (config.experimental?.serverComponentsExternalPackages) {
    nextConfig.experimental.serverExternalPackages =
      config.experimental.serverComponentsExternalPackages;
    delete nextConfig.experimental.serverComponentsExternalPackages;
  }

  if ("swcMinify" in config) {
    console.warn("`swcMinify` is deprecated and will be ignored.");
    delete nextConfig.swcMinify;
  }
}

export default nextConfig;
