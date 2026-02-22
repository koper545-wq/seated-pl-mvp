"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, User, LogOut, Settings, Calendar, Users, Heart, ChefHat, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOut } from "next-auth/react";
import { useCurrentUser, type ActiveMode } from "@/hooks/use-current-user";
import { useMVPMode } from "@/contexts/mvp-mode-context";

export function Header() {
  const t = useTranslations("nav");
  const { user, effectiveRole, canSwitchMode, switchMode, activeMode, isLoading, isAuthenticated } = useCurrentUser();
  const { mvpMode } = useMVPMode();

  // Build currentUser for display
  const currentUser = user
    ? {
        name: (user as { name?: string }).name || "",
        email: (user as { email?: string }).email || "",
        image: (user as { image?: string | null }).image || null,
      }
    : null;

  // Use effective role for determining what to show
  const isHost = effectiveRole === "host";
  const dashboardHref = isHost ? "/dashboard/host" : "/dashboard";

  // Navigation items - filter based on MVP mode
  const allNavigation = [
    { name: t("events"), href: "/events", mvpHidden: false },
    { name: t("howItWorks"), href: "/how-it-works", mvpHidden: false },
    { name: t("becomeHost"), href: "/become-host", mvpHidden: true },
    { name: t("giftCards"), href: "/gift-cards", mvpHidden: true },
  ];

  const navigation = mvpMode
    ? allNavigation.filter((item) => !item.mvpHidden)
    : allNavigation;

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSwitchMode = () => {
    const newMode: ActiveMode = activeMode === "host" ? "guest" : "host";
    switchMode(newMode);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-amber-600">Seated</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 -translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />

            {isLoading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardHref}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("dashboard")}
                </Link>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={currentUser.image || undefined}
                          alt={currentUser.name || "User"}
                        />
                        <AvatarFallback className={isHost ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}>
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle className="text-left">{t("myAccount")}</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center gap-3 mt-6 pb-4 border-b">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={currentUser.image || undefined}
                          alt={currentUser.name || "User"}
                        />
                        <AvatarFallback className={isHost ? "bg-purple-100 text-purple-700 text-lg" : "bg-amber-100 text-amber-700 text-lg"}>
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {currentUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {isHost ? (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              Tryb hosta
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Tryb gościa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mode switcher for individual hosts */}
                    {canSwitchMode && (
                      <div className="py-3 border-b">
                        <button
                          onClick={handleSwitchMode}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-purple-50 hover:from-amber-100 hover:to-purple-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <ArrowLeftRight className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium">
                              Przełącz na tryb {activeMode === "host" ? "gościa" : "hosta"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${activeMode === "host" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
                              {activeMode === "host" ? "Host" : "Gość"}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${activeMode === "host" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>
                              {activeMode === "host" ? "Gość" : "Host"}
                            </span>
                          </div>
                        </button>
                      </div>
                    )}

                    <nav className="flex flex-col space-y-1 mt-4">
                      {isHost ? (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard/host"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <ChefHat className="h-4 w-4" />
                              <span>Panel hosta</span>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard/host/calendar"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <Calendar className="h-4 w-4" />
                              <span>Moje wydarzenia</span>
                            </Link>
                          </SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <User className="h-4 w-4" />
                              <span>{t("profile")}</span>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard/bookings"
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <Calendar className="h-4 w-4" />
                              <span>{t("myBookings")}</span>
                            </Link>
                          </SheetClose>
                          {!mvpMode && (
                            <>
                              <SheetClose asChild>
                                <Link
                                  href="/dashboard/homies"
                                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                >
                                  <Users className="h-4 w-4" />
                                  <span>{t("homies")}</span>
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link
                                  href="/dashboard/wishlist"
                                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                >
                                  <Heart className="h-4 w-4" />
                                  <span>{t("wishlist")}</span>
                                </Link>
                              </SheetClose>
                            </>
                          )}
                        </>
                      )}
                      <SheetClose asChild>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>{t("settings")}</span>
                        </Link>
                      </SheetClose>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          localStorage.removeItem("seated-mock-user");
                          localStorage.removeItem("seated-active-mode");
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-red-600 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t("logout")}</span>
                      </button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/register">{t("register")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-amber-600">
                    Seated
                  </SheetTitle>
                </SheetHeader>

                {currentUser && (
                  <div className="flex items-center gap-3 mt-6 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={currentUser.image || undefined}
                        alt={currentUser.name || "User"}
                      />
                      <AvatarFallback className={isHost ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                      {isHost ? (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Tryb hosta
                        </span>
                      ) : canSwitchMode ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Tryb gościa
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Mode switcher for mobile */}
                {canSwitchMode && currentUser && (
                  <div className="py-3 border-b">
                    <button
                      onClick={handleSwitchMode}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-purple-50"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">
                        Przełącz na tryb {activeMode === "host" ? "gościa" : "hosta"}
                      </span>
                    </button>
                  </div>
                )}

                <nav className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="text-lg font-medium text-foreground hover:text-amber-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}

                  <hr className="my-2" />

                  {currentUser ? (
                    <>
                      {isHost ? (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard/host"
                              className="text-lg font-medium text-foreground hover:text-amber-600 transition-colors"
                            >
                              Panel hosta
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard/host/calendar"
                              className="text-lg font-medium text-foreground hover:text-amber-600 transition-colors"
                            >
                              Moje wydarzenia
                            </Link>
                          </SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard"
                              className="text-lg font-medium text-foreground hover:text-amber-600 transition-colors"
                            >
                              {t("dashboard")}
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              href="/dashboard/bookings"
                              className="text-lg font-medium text-foreground hover:text-amber-600 transition-colors"
                            >
                              {t("myBookings")}
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      <button
                        onClick={() => {
                          localStorage.removeItem("seated-mock-user");
                          localStorage.removeItem("seated-active-mode");
                          signOut({ callbackUrl: "/" });
                        }}
                        className="text-lg font-medium text-red-600 hover:text-red-700 transition-colors text-left"
                      >
                        {t("logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="text-lg font-medium text-foreground hover:text-amber-600 transition-colors"
                        >
                          {t("login")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          asChild
                          className="bg-amber-600 hover:bg-amber-700 mt-2"
                        >
                          <Link href="/register">{t("register")}</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
