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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ChefHat } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "@/components/icons";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError(t("register.errors.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError("Hasło musi mieć minimum 8 znaków");
      return;
    }

    if (!ageVerified) {
      setError("Musisz potwierdzić, że masz 18 lat");
      return;
    }

    if (!termsAccepted) {
      setError("Musisz zaakceptować regulamin");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "GUEST",
          firstName,
          lastName,
          ageVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("register.errors.generic"));
        return;
      }

      // Redirect to login with success message
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

  return (
    <Card className="w-full max-w-md">
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

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading || isOAuthLoading !== null}
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
            disabled={isLoading || isOAuthLoading !== null}
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

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("register.firstName")} *</Label>
              <Input
                id="firstName"
                placeholder="Jan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading || isOAuthLoading !== null}
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
                disabled={isLoading || isOAuthLoading !== null}
                required
              />
            </div>
          </div>

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
              disabled={isLoading || isOAuthLoading !== null}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("register.password")} *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 znaków"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || isOAuthLoading !== null}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("register.confirmPassword")} *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Powtórz hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || isOAuthLoading !== null}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="age"
                checked={ageVerified}
                onCheckedChange={(checked) => setAgeVerified(checked === true)}
                disabled={isLoading || isOAuthLoading !== null}
              />
              <Label htmlFor="age" className="text-sm font-normal leading-tight">
                Potwierdzam, że mam ukończone 18 lat *
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                disabled={isLoading || isOAuthLoading !== null}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                Akceptuję{" "}
                <Link href="/terms" className="text-amber-600 hover:underline">
                  regulamin
                </Link>{" "}
                i{" "}
                <Link href="/privacy" className="text-amber-600 hover:underline">
                  politykę prywatności
                </Link>{" "}
                *
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isLoading || isOAuthLoading !== null}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("register.submitting")}
              </>
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

        {/* Host CTA */}
        <div className="mt-2 pt-4 border-t w-full">
          <Link
            href="/become-host"
            className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-amber-700 text-sm font-medium"
          >
            <ChefHat className="h-4 w-4" />
            Chcesz zostać hostem? Złóż aplikację
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
