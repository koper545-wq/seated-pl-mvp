"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { currentGuestProfile, dietaryOptions, eventTypes, profileLanguages, getGuestProfileByMockUserId, getHostProfileByMockUserId } from "@/lib/mock-data";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

function LanguageSelector() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/en") ? "en" : "pl";

  const handleLanguageChange = (langValue: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(pl|en)/, "");
    window.location.href = `/${langValue}${pathWithoutLocale}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>🌐</span> Język
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-stone-500">
          Wybierz preferowany język interfejsu
        </p>
        <div className="grid grid-cols-2 gap-3">
          {profileLanguages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                currentLocale === lang.value
                  ? "border-amber-500 bg-amber-50"
                  : "hover:border-stone-300"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user, isLoading, isMockUser, guestProfile: apiGuestProfile, hostProfile: apiHostProfile } = useCurrentUser();

  // Get profile based on mock user or real user
  const getInitialProfile = () => {
    if (isMockUser && user && 'id' in user) {
      const mockUser = user as { id: string; role?: string; email?: string };
      if (mockUser.role === "host") {
        const hp = getHostProfileByMockUserId(mockUser.id);
        if (hp) {
          return {
            ...currentGuestProfile,
            id: hp.id,
            firstName: hp.name.split(" ")[0] || hp.name,
            lastName: hp.name.split(" ").slice(1).join(" ") || "",
            email: mockUser.email || "",
            avatar: hp.avatar,
            city: hp.city,
            bio: hp.bio,
          };
        }
      } else {
        const gp = getGuestProfileByMockUserId(mockUser.id);
        if (gp) return gp;
      }
      return currentGuestProfile;
    }

    // Real user
    if (user && 'email' in user) {
      return {
        ...currentGuestProfile,
        id: (user as { id: string }).id || "",
        firstName: apiGuestProfile?.firstName || (user as { name?: string }).name?.split(" ")[0] || "",
        lastName: apiGuestProfile?.lastName || (user as { name?: string }).name?.split(" ").slice(1).join(" ") || "",
        email: (user as { email: string }).email || "",
        avatar: apiGuestProfile?.avatarUrl || (user as { image?: string | null }).image || "",
        bio: apiGuestProfile?.bio || "",
        dietaryRestrictions: apiGuestProfile?.dietaryRestrictions || [],
        allergies: apiGuestProfile?.allergies || [],
      };
    }

    return currentGuestProfile;
  };

  const [profile, setProfile] = useState(getInitialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update profile when user changes
  useEffect(() => {
    if (!isLoading) {
      setProfile(getInitialProfile());
    }
  }, [isLoading, user, isMockUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);

    if (!isMockUser) {
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
            bio: profile.bio,
            dietaryRestrictions: profile.dietaryRestrictions,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
      } catch (error) {
        console.error("Save profile error:", error);
        setIsSaving(false);
        return;
      }
    } else {
      // Mock user — simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    alert("Funkcja uploadu zdjęć zostanie dodana po integracji z Cloudinary");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← Wróć
                </Button>
              </Link>
              <h1 className="font-semibold text-stone-900">Ustawienia</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSaving ? "Zapisuję..." : saved ? "✓ Zapisano" : "Zapisz"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-8 space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📸</span> Zdjęcie profilowe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center text-3xl">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>
              <div className="flex-1">
                <Button onClick={handlePhotoUpload} variant="outline" size="sm">
                  Zmień zdjęcie
                </Button>
                <p className="text-xs text-stone-500 mt-2">
                  JPG, PNG. Maks. 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>👤</span> Podstawowe informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Imię</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-stone-50"
              />
              <p className="text-xs text-stone-500 mt-1">
                Email nie może być zmieniony
              </p>
            </div>

            <div>
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="bio">O mnie</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Opowiedz coś o sobie i swojej pasji do jedzenia..."
                rows={4}
              />
              <p className="text-xs text-stone-500 mt-1">
                Maks. 500 znaków. Widoczne na profilu publicznym.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Preference */}
        <LanguageSelector />

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔗</span> Media społecznościowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-stone-100 border border-r-0 rounded-l-md text-stone-500 text-sm">
                  @
                </span>
                <Input
                  id="instagram"
                  value={profile.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: {
                        ...profile.socialLinks,
                        instagram: e.target.value,
                      },
                    })
                  }
                  className="rounded-l-none"
                  placeholder="twoj_instagram"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={profile.socialLinks?.facebook || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: {
                      ...profile.socialLinks,
                      facebook: e.target.value,
                    },
                  })
                }
                placeholder="Link do profilu Facebook"
              />
            </div>

            <div>
              <Label htmlFor="tiktok">TikTok</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-stone-100 border border-r-0 rounded-l-md text-stone-500 text-sm">
                  @
                </span>
                <Input
                  id="tiktok"
                  value={profile.socialLinks?.tiktok || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: {
                        ...profile.socialLinks,
                        tiktok: e.target.value,
                      },
                    })
                  }
                  className="rounded-l-none"
                  placeholder="twoj_tiktok"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔒</span> Prywatność
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">Profil publiczny</p>
                <p className="text-sm text-stone-500">
                  Inni użytkownicy mogą zobaczyć Twój profil, odznaki i
                  wydarzenia
                </p>
              </div>
              <Switch
                checked={profile.isPublic}
                onCheckedChange={(checked) =>
                  setProfile({ ...profile, isPublic: checked })
                }
              />
            </div>

            <div className="p-4 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600">
                {profile.isPublic ? (
                  <>
                    🌐 Twój profil jest widoczny pod adresem:{" "}
                    <Link
                      href={`/profile/${profile.id}`}
                      className="text-amber-600 underline"
                    >
                      seated.pl/profile/{profile.id}
                    </Link>
                  </>
                ) : (
                  <>🔒 Twój profil jest ukryty przed innymi użytkownikami</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🥗</span> Preferencje dietetyczne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-500 mb-4">
              Wybierz swoje preferencje, a hosty będą o nich wiedzieć przed
              wydarzeniem
            </p>
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.slice(0, -1).map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={profile.dietaryRestrictions.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProfile({
                          ...profile,
                          dietaryRestrictions: [
                            ...profile.dietaryRestrictions,
                            option.value,
                          ],
                        });
                      } else {
                        setProfile({
                          ...profile,
                          dietaryRestrictions:
                            profile.dietaryRestrictions.filter(
                              (d) => d !== option.value
                            ),
                        });
                      }
                    }}
                  />
                  <span className="text-sm text-stone-700">{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>❤️</span> Ulubione kategorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-500 mb-4">
              Wybierz kategorie wydarzeń, które Cię interesują
            </p>
            <div className="flex flex-wrap gap-2">
              {eventTypes.slice(1).map((type) => {
                const isSelected = profile.favoriteCategories.includes(
                  type.value
                );
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      if (isSelected) {
                        setProfile({
                          ...profile,
                          favoriteCategories: profile.favoriteCategories.filter(
                            (c) => c !== type.value
                          ),
                        });
                      } else {
                        setProfile({
                          ...profile,
                          favoriteCategories: [
                            ...profile.favoriteCategories,
                            type.value,
                          ],
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Profile Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🖼️</span> Zdjęcia z wydarzeń
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-500 mb-4">
              Dodaj zdjęcia z wydarzeń, które pojawią się na Twoim profilu
              publicznym
            </p>

            {profile.photos.length === 0 ? (
              <div
                onClick={handlePhotoUpload}
                className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
              >
                <span className="text-4xl mb-2 block">📷</span>
                <p className="text-stone-600">Kliknij aby dodać zdjęcia</p>
                <p className="text-xs text-stone-400 mt-1">
                  Maks. 6 zdjęć, każde do 5MB
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {profile.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-stone-200 rounded-lg relative"
                  >
                    <img
                      src={photo}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs">
                      ×
                    </button>
                  </div>
                ))}
                {profile.photos.length < 6 && (
                  <div
                    onClick={handlePhotoUpload}
                    className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors"
                  >
                    <span className="text-2xl text-stone-400">+</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔐</span> Połączone konta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔵</span>
                <div>
                  <p className="font-medium text-stone-900">Google</p>
                  <p className="text-sm text-stone-500">jan@gmail.com</p>
                </div>
              </div>
              <span className="text-green-600 text-sm">✓ Połączone</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📘</span>
                <div>
                  <p className="font-medium text-stone-900">Facebook</p>
                  <p className="text-sm text-stone-500">Nie połączone</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Połącz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 flex items-center gap-2">
              <span>⚠️</span> Strefa niebezpieczna
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">Wyloguj się</p>
                <p className="text-sm text-stone-500">
                  Wyloguj ze wszystkich urządzeń
                </p>
              </div>
              <Button variant="outline" size="sm">
                Wyloguj
              </Button>
            </div>

            <hr />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-600">Usuń konto</p>
                <p className="text-sm text-stone-500">
                  Trwale usuń konto i wszystkie dane
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Usuń konto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Czy na pewno chcesz usunąć konto?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja jest nieodwracalna. Wszystkie Twoje dane,
                      rezerwacje i historia zostaną trwale usunięte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                      Tak, usuń moje konto
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
