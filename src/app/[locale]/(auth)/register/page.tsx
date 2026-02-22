"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ChefHat, User, Phone } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type UserType = "GUEST" | "HOST";

const cuisineOptions = [
  { value: "polish", label: "Polska" },
  { value: "italian", label: "Wloska" },
  { value: "french", label: "Francuska" },
  { value: "asian", label: "Azjatycka" },
  { value: "japanese", label: "Japonska" },
  { value: "indian", label: "Indyjska" },
  { value: "mexican", label: "Meksykanska" },
  { value: "mediterranean", label: "Srodziemnomorska" },
  { value: "middle-eastern", label: "Bliskowschodnia" },
  { value: "american", label: "Amerykanska" },
  { value: "vegan", label: "Weganska" },
  { value: "vegetarian", label: "Wegetarianska" },
  { value: "fusion", label: "Fusion" },
  { value: "pastry", label: "Cukiernictwo" },
  { value: "wine", label: "Wino i sommelierstwo" },
  { value: "other", label: "Inna" },
];

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");

  const [userType, setUserType] = useState<UserType>("GUEST");

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  // Guest fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Host fields
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city] = useState("Wroclaw");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const handleCuisineToggle = (value: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("register.errors.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError("Haslo musi miec minimum 8 znakow");
      return;
    }

    if (!ageVerified) {
      setError("Musisz potwierdzic, ze masz 18 lat");
      return;
    }

    if (!termsAccepted) {
      setError("Musisz zaakceptowac regulamin");
      return;
    }

    if (userType === "HOST") {
      if (!businessName.trim()) {
        setError("Podaj nazwe firmy / restauracji");
        return;
      }
      if (!phoneNumber.trim() || phoneNumber.length < 9) {
        setError("Podaj prawidlowy numer telefonu");
        return;
      }
      if (selectedCuisines.length === 0) {
        setError("Wybierz przynajmniej jeden typ kuchni");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType,
          firstName: userType === "GUEST" ? firstName : undefined,
          lastName: userType === "GUEST" ? lastName : undefined,
          businessName: userType === "HOST" ? businessName : undefined,
          phoneNumber: userType === "HOST" ? phoneNumber : undefined,
          city: userType === "HOST" ? city : undefined,
          cuisineSpecialties: userType === "HOST" ? selectedCuisines : undefined,
          description: userType === "HOST" && description.trim() ? description : undefined,
          ageVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("register.errors.generic"));
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError(t("register.errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    setIsOAuthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setError(t("register.errors.generic"));
      setIsOAuthLoading(null);
    }
  };

  const isDisabled = isLoading || isOAuthLoading !== null;

  return (
    <Card className={cn("w-full", userType === "HOST" ? "max-w-lg" : "max-w-md")}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
        <CardDescription>{t("register.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* User Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUserType("GUEST")}
            disabled={isDisabled}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              userType === "GUEST"
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-stone-200 hover:border-stone-300 text-stone-600"
            )}
          >
            <User className={cn("h-6 w-6", userType === "GUEST" ? "text-amber-600" : "text-stone-400")} />
            <span className="font-semibold text-sm">Gosc</span>
            <span className="text-xs text-center leading-tight opacity-75">
              Chce brac udzial w wydarzeniach
            </span>
          </button>
          <button
            type="button"
            onClick={() => setUserType("HOST")}
            disabled={isDisabled}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              userType === "HOST"
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-stone-200 hover:border-stone-300 text-stone-600"
            )}
          >
            <ChefHat className={cn("h-6 w-6", userType === "HOST" ? "text-amber-600" : "text-stone-400")} />
            <span className="font-semibold text-sm">Host</span>
            <span className="text-xs text-center leading-tight opacity-75">
              Chce organizowac wydarzenia
            </span>
          </button>
        </div>

        {/* OAuth Buttons - only for guests */}
        {userType === "GUEST" && (
          <>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isDisabled}
              >
                {isOAuthLoading === "google" ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2 h-5 w-5" />
                )}
                {t("continueWithGoogle")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={isDisabled}
              >
                {isOAuthLoading === "facebook" ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <FacebookIcon className="mr-2 h-5 w-5" />
                )}
                {t("continueWithFacebook")}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("orDivider")}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Guest: Name fields */}
          {userType === "GUEST" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("register.firstName")} *</Label>
                <Input
                  id="firstName"
                  placeholder="Jan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isDisabled}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("register.lastName")} *</Label>
                <Input
                  id="lastName"
                  placeholder="Kowalski"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isDisabled}
                  required
                />
              </div>
            </div>
          )}

          {/* Host: Extended fields */}
          {userType === "HOST" && (
            <>
              {/* Business name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Nazwa firmy / restauracji *</Label>
                <Input
                  id="businessName"
                  placeholder="np. Trattoria da Marco"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isDisabled}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  <Phone className="inline h-3.5 w-3.5 mr-1" />
                  Telefon *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+48 123 456 789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isDisabled}
                  required
                />
              </div>

              {/* Cuisine specialties */}
              <div className="space-y-2">
                <Label>Typ kuchni *</Label>
                <div className="flex flex-wrap gap-1.5">
                  {cuisineOptions.map((cuisine) => (
                    <Badge
                      key={cuisine.value}
                      variant={selectedCuisines.includes(cuisine.value) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all text-xs",
                        selectedCuisines.includes(cuisine.value)
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "hover:bg-amber-50"
                      )}
                      onClick={() => !isDisabled && handleCuisineToggle(cuisine.value)}
                    >
                      {cuisine.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Krotki opis</Label>
                <Textarea
                  id="description"
                  placeholder="Opowiedz o sobie i swoich wydarzeniach..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isDisabled}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("register.email")} *</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isDisabled}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("register.password")} *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 znakow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("register.confirmPassword")} *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Powtorz haslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isDisabled}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="age"
                checked={ageVerified}
                onCheckedChange={(checked) => setAgeVerified(checked === true)}
                disabled={isDisabled}
              />
              <Label htmlFor="age" className="text-sm font-normal leading-tight">
                Potwierdzam, ze mam ukonczone 18 lat *
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                disabled={isDisabled}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                Akceptuje{" "}
                <Link href="/terms" className="text-amber-600 hover:underline">
                  regulamin
                </Link>{" "}
                i{" "}
                <Link href="/privacy" className="text-amber-600 hover:underline">
                  polityke prywatnosci
                </Link>{" "}
                *
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isDisabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("register.submitting")}
              </>
            ) : userType === "HOST" ? (
              "Stworz konto hosta"
            ) : (
              t("register.submit")
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <p className="text-sm text-center text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            {t("register.login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
