declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    sw?: string;
    scope?: string;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    subdomainPrefix?: string;
    fallbacks?: {
      document?: string;
      image?: string;
      font?: string;
      audio?: string;
      video?: string;
    };
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    customWorkerDir?: string;
    customWorkerWebpack?: (config: unknown) => unknown;
    runtimeCaching?: unknown[];
  }

  function withPWAInit(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWAInit;
}
