"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ChefHat,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Użytkownicy", icon: Users },
  { href: "/admin/events", label: "Wydarzenia", icon: Calendar },
  { href: "/admin/hosts", label: "Hosty", icon: ChefHat },
  { href: "/admin/analytics", label: "Analityka", icon: BarChart3 },
  { href: "/admin/settings", label: "Ustawienia", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden md:flex md:w-64 h-screen flex-col bg-stone-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-700">
        <Shield className="h-8 w-8 text-amber-400" />
        <div>
          <p className="font-bold text-lg">Seated</p>
          <p className="text-xs text-stone-400">Panel Admina</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-600 text-white"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stone-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors"
        >
          ← Wróć na stronę
        </Link>
      </div>
    </aside>
  );
}
