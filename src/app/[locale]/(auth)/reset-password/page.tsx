"use client";

import { Suspense, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, ArrowLeft, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-4">Nieprawidlowy link</h2>
          <p className="text-muted-foreground mb-6">
            Link do resetowania hasla jest nieprawidlowy lub wygasl.
          </p>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/forgot-password">Popros o nowy link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-4">Haslo zmienione!</h2>
          <p className="text-muted-foreground mb-6">
            Twoje haslo zostalo pomyslnie zmienione. Mozesz sie teraz zalogowac.
          </p>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/login">Zaloguj sie</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Haslo musi miec minimum 8 znakow");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasla nie sa takie same");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Wystapil blad. Sprobuj ponownie.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Wystapil blad. Sprobuj ponownie pozniej.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Ustaw nowe haslo</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Wpisz nowe haslo do swojego konta
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nowe haslo</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 znakow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Powtorz haslo</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Powtorz nowe haslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zmienianie hasla...
              </>
            ) : (
              "Zmien haslo"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-amber-600 hover:text-amber-700 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Wroc do logowania
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
