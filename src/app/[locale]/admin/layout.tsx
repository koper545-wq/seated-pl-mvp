"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/analytics", label: "Analityka", icon: "📈" },
  { href: "/admin/hosts", label: "Hosty", icon: "👨‍🍳" },
  { href: "/admin/events", label: "Wydarzenia", icon: "🎉" },
  { href: "/admin/users", label: "Użytkownicy", icon: "👥" },
  { href: "/admin/reports", label: "Zgłoszenia", icon: "🚨" },
  { href: "/admin/badges", label: "Odznaki", icon: "🏅" },
  { href: "/admin/vouchers", label: "Kupony", icon: "🎟️" },
  { href: "/admin/settings", label: "Ustawienia", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Top Header */}
      <header className="bg-stone-900 text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-xl font-bold">
                🍽️ Seated <span className="text-amber-400">Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-stone-400 hover:text-white">
                ← Wróć do strony
              </Link>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold">
                  A
                </span>
                <span className="text-sm">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-stone-200 min-h-[calc(100vh-56px)] sticky top-14 hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-50 text-amber-700"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 md:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-4",
                  isActive ? "text-amber-600" : "text-stone-400"
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
