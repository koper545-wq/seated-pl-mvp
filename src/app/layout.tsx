import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seated",
  description: "Culinary experiences in Wrocław",
};

// This is a minimal root layout required by Next.js
// The actual layout with providers is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
