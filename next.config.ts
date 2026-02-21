import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "next-pwa";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: false, // Wyłączone tymczasowo - zapobiega podwójnym renderom w dev
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Sprawdzaj zmiany co 1s zamiast ciągle
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default withPWA(withNextIntl(nextConfig));
