import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { Header, Footer } from "@/components/layout";
import { SessionProvider } from "@/components/providers";
// Dev tools disabled in MVP production
// import { DevAccountSwitcher, MVPModeSwitcher } from "@/components/dev";
import { EventsProvider } from "@/contexts/events-context";
import { MVPModeProvider } from "@/contexts/mvp-mode-context";
import { BookingsProvider } from "@/contexts/bookings-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    pl: "Seated - Kulinarne doświadczenia we Wrocławiu",
    en: "Seated - Culinary Experiences in Wrocław",
  };

  const descriptions = {
    pl: "Odkryj wyjątkowe wydarzenia kulinarne - supper clubs, pop-upy, warsztaty gotowania i więcej. Dołącz do społeczności food lovers.",
    en: "Discover unique culinary events - supper clubs, pop-ups, cooking workshops and more. Join the food lovers community.",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.pl,
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.pl,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Seated",
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "pl" | "en")) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="application-name" content="Seated" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Seated" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <MVPModeProvider>
              <EventsProvider>
                <BookingsProvider>
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  {/* Dev tools disabled in MVP */}
                </BookingsProvider>
              </EventsProvider>
            </MVPModeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
