"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Building2, User, MapPin, ChefHat } from "lucide-react";

const EVENT_TYPE_OPTIONS = [
  { value: "supper_club", label: "Klub kolacyjny" },
  { value: "cooking_class", label: "Warsztaty kulinarne" },
  { value: "tasting", label: "Degustacja" },
  { value: "popup", label: "Pop-up" },
  { value: "active_food", label: "Aktywne doświadczenia" },
];

const EXPERIENCE_OPTIONS = [
  { value: "yes", label: "Tak, mam doświadczenie" },
  { value: "no", label: "Nie, to będzie mój pierwszy raz" },
  { value: "professional", label: "Jestem profesjonalnym kucharzem" },
];

interface OnboardingData {
  hostSubtype: string | null;
  onboardingCompleted: boolean;
  businessName: string;
  description: string | null;
}

export default function HostOnboardingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostSubtype, setHostSubtype] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");

  // Address fields
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("Wrocław");

  // Business fields
  const [nip, setNip] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPosition, setContactPosition] = useState("");

  // Individual fields
  const [experienceLevel, setExperienceLevel] = useState("");
  const [experienceDetails, setExperienceDetails] = useState("");

  // Common
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  // Load current onboarding data
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    fetch("/api/host/onboarding")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not a host");
      })
      .then((data: { hostProfile: OnboardingData }) => {
        if (data.hostProfile.onboardingCompleted) {
          router.push("/dashboard/host");
          return;
        }
        setHostSubtype(data.hostProfile.hostSubtype);
        setBusinessName(data.hostProfile.businessName || "");
        setDescription(data.hostProfile.description || "");
      })
      .catch(() => {
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [session, sessionStatus, router]);

  const totalSteps = 3;

  const toggleEventType = (value: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const canProceedStep1 = () => {
    if (!street || !postalCode || !city) return false;
    if (hostSubtype === "business") {
      return true; // NIP and other fields are optional
    }
    return true;
  };

  const canProceedStep2 = () => {
    if (hostSubtype === "individual") {
      return experienceLevel !== "";
    }
    return true;
  };

  const canSubmit = () => {
    return selectedEventTypes.length > 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        address: { street, apartment, postalCode, city },
        eventTypes: selectedEventTypes,
        description: description || undefined,
      };

      if (hostSubtype === "business") {
        payload.nip = nip || undefined;
        payload.website = website || undefined;
        if (contactName || contactPhone) {
          payload.contactPerson = {
            name: contactName,
            phone: contactPhone,
            position: contactPosition,
          };
        }
      } else {
        payload.experienceLevel = experienceLevel;
        payload.experienceDetails = experienceDetails || undefined;
      }

      const res = await fetch("/api/host/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStep(totalSteps + 1); // success state
        setTimeout(() => router.push("/dashboard/host"), 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Success state
  if (step > totalSteps) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Onboarding zakończony!</h2>
            <p className="text-muted-foreground mb-6">
              Twój profil hosta został uzupełniony. Przekierowujemy Cię do panelu hosta...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-amber-600 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBusiness = hostSubtype === "business";

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Uzupełnij swój profil hosta
          </h1>
          <p className="text-stone-500">
            {businessName && `Cześć, ${businessName}! `}
            Wypełnij poniższe informacje, aby dokończyć konfigurację konta.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i + 1 <= step ? "bg-amber-500 w-12" : "bg-stone-200 w-8"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Address + Business/Contact details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-600" />
                {isBusiness ? "Dane firmy i adres" : "Twój adres"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isBusiness
                  ? "Podaj dane firmy i adres lokalu"
                  : "Podaj adres, pod którym będziesz organizować wydarzenia"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isBusiness && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nip">NIP (opcjonalne)</Label>
                      <Input
                        id="nip"
                        placeholder="1234567890"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Strona WWW / Instagram</Label>
                      <Input
                        id="website"
                        placeholder="https://..."
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Osoba kontaktowa</Label>
                      <Input
                        id="contactName"
                        placeholder="Imię i nazwisko"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefon kontaktowy</Label>
                      <Input
                        id="contactPhone"
                        placeholder="+48..."
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPosition">Stanowisko (opcjonalne)</Label>
                    <Input
                      id="contactPosition"
                      placeholder="np. Manager, Właściciel"
                      value={contactPosition}
                      onChange={(e) => setContactPosition(e.target.value)}
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-stone-700 mb-3">Adres lokalu</p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Ulica i numer *</Label>
                  <Input
                    id="street"
                    placeholder="ul. Przykładowa 15"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">Lokal</Label>
                  <Input
                    id="apartment"
                    placeholder="np. 3A"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Kod pocztowy *</Label>
                  <Input
                    id="postalCode"
                    placeholder="00-000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Miasto *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-stone-500">
                * Adres jest prywatny — goście otrzymają go 24h przed wydarzeniem.
              </p>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Dalej
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Experience (individual) or Description (business) */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-amber-600" />
                {isBusiness ? "O Twojej działalności" : "Twoje doświadczenie"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isBusiness
                  ? "Opowiedz o swojej restauracji / firmie"
                  : "Powiedz nam o swoim doświadczeniu kulinarnym"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isBusiness && (
                <>
                  <div className="space-y-2">
                    <Label>Doświadczenie kulinarne *</Label>
                    <div className="space-y-2">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            experienceLevel === opt.value
                              ? "border-amber-500 bg-amber-50"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="experience"
                            value={opt.value}
                            checked={experienceLevel === opt.value}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="accent-amber-600"
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {(experienceLevel === "yes" || experienceLevel === "professional") && (
                    <div className="space-y-2">
                      <Label htmlFor="experienceDetails">Opowiedz o swoim doświadczeniu</Label>
                      <Textarea
                        id="experienceDetails"
                        placeholder="Jakie wydarzenia organizowałeś/aś? Dla ilu osób? Jakie były reakcje gości?"
                        value={experienceDetails}
                        onChange={(e) => setExperienceDetails(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">
                  {isBusiness ? "Opis działalności" : "Bio — opowiedz o swojej pasji kulinarnej"}
                </Label>
                <Textarea
                  id="description"
                  placeholder={
                    isBusiness
                      ? "Opowiedz o swojej restauracji, kuchni, filozofii..."
                      : "Co Cię napędza w kuchni? Jaka jest Twoja kulinarna historia?"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Wstecz
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Dalej
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Event Types */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isBusiness ? (
                  <Building2 className="h-5 w-5 text-amber-600" />
                ) : (
                  <User className="h-5 w-5 text-amber-600" />
                )}
                Jakie wydarzenia chcesz organizować?
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Wybierz typy wydarzeń, które Cię interesują (min. 1)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedEventTypes.includes(opt.value)
                        ? "border-amber-500 bg-amber-50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEventTypes.includes(opt.value)}
                      onChange={() => toggleEventType(opt.value)}
                      className="accent-amber-600 h-4 w-4"
                    />
                    <span className="font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Wstecz
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit() || submitting}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    "Zakończ i przejdź do panelu"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
