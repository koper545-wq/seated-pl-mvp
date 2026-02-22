"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Wystapil blad. Sprobuj ponownie.");
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("Wystapil blad. Sprobuj ponownie pozniej.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Sprawdz swoja skrzynke
          </h2>
          <p className="text-muted-foreground mb-6">
            Wyslalismy link do resetowania hasla na adres{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Jesli nie widzisz wiadomosci, sprawdz folder spam. Link jest wazny
            przez 1 godzine.
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setError("");
              }}
            >
              Wyslij ponownie
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wroc do logowania
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Zresetuj haslo</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Podaj adres e-mail powiazany z Twoim kontem, a wyslemy Ci link do
          resetowania hasla.
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wysylanie...
              </>
            ) : (
              "Wyslij link resetujacy"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-amber-600 hover:text-amber-700 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Wroc do logowania
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Nie masz jeszcze konta?{" "}
            <Link
              href="/register"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Zarejestruj sie
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
