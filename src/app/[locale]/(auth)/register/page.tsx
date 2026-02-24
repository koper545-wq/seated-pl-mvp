"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { pl } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  ChefHat,
  User,
  Phone,
  Building2,
  MapPin,
  Utensils,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CalendarDays,
  Clock,
} from "lucide-react";
import { GoogleIcon, FacebookIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type UserType = "GUEST" | "HOST";
type HostSubtype = "business" | "individual";

const cuisineOptions = [
  { value: "polish", label: "Polska" },
  { value: "italian", label: "Włoska" },
  { value: "french", label: "Francuska" },
  { value: "asian", label: "Azjatycka" },
  { value: "japanese", label: "Japońska" },
  { value: "indian", label: "Indyjska" },
  { value: "mexican", label: "Meksykańska" },
  { value: "mediterranean", label: "Śródziemnomorska" },
  { value: "middle-eastern", label: "Bliskowschodnia" },
  { value: "american", label: "Amerykańska" },
  { value: "vegan", label: "Wegańska" },
  { value: "vegetarian", label: "Wegetariańska" },
  { value: "fusion", label: "Fusion" },
  { value: "pastry", label: "Cukiernictwo" },
  { value: "wine", label: "Wino i sommelierstwo" },
  { value: "other", label: "Inna" },
];

const eventTypeOptions = [
  { value: "supper-club", label: "Supper Club", desc: "Kolacje w prywatnym domu" },
  { value: "cooking-class", label: "Warsztaty kulinarne", desc: "Wspólne gotowanie i nauka" },
  { value: "tasting", label: "Degustacje", desc: "Wino, kawa, ser, czekolada..." },
  { value: "popup", label: "Pop-up", desc: "Tymczasowe wydarzenia restauracyjne" },
  { value: "active-food", label: "Active + Food", desc: "Bieg, joga, rower + jedzenie" },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  const [userType, setUserType] = useState<UserType>(
    searchParams.get("type") === "host" ? "HOST" : "GUEST"
  );
  const [hostSubtype, setHostSubtype] = useState<HostSubtype>("individual");

  // Host registration step (1: account, 2: experience, 3: address + submit)
  const [hostStep, setHostStep] = useState(1);

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

  // Host fields — Step 1: Account
  const [businessName, setBusinessName] = useState("");
  const [hostFirstName, setHostFirstName] = useState("");
  const [hostLastName, setHostLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city] = useState("Wrocław");

  // Host fields — Step 2: Experience & Cuisine
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [hasExperience, setHasExperience] = useState<string>("");
  const [experienceDetails, setExperienceDetails] = useState("");
  const [description, setDescription] = useState("");
  const [customCuisine, setCustomCuisine] = useState("");

  // Host fields — Step 3: Address
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Restaurant-specific
  const [nip, setNip] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Verification appointment
  const [verificationDate, setVerificationDate] = useState<Date | undefined>(undefined);
  const [verificationTimeSlot, setVerificationTimeSlot] = useState("");

  const handleCuisineToggle = (value: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
    if (value === "other") {
      setCustomCuisine("");
    }
  };

  const handleEventTypeToggle = (value: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  // Validation for host steps
  const isHostStep1Valid = () => {
    if (!email || !password || password.length < 8 || password !== confirmPassword) return false;
    if (!ageVerified || !termsAccepted) return false;
    if (!phoneNumber || phoneNumber.length < 9) return false;
    if (hostSubtype === "business") {
      return businessName.trim().length >= 2;
    } else {
      return hostFirstName.trim().length >= 2 && hostLastName.trim().length >= 2;
    }
  };

  const isHostStep2Valid = () => {
    return selectedCuisines.length > 0 && selectedEventTypes.length > 0 && hasExperience !== "";
  };

  const isHostStep3Valid = () => {
    return street.length >= 3 && postalCode.length >= 5;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

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
      const finalBusinessName =
        userType === "HOST"
          ? hostSubtype === "business"
            ? businessName
            : `${hostFirstName} ${hostLastName}`
          : undefined;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType,
          firstName: userType === "GUEST" ? firstName : undefined,
          lastName: userType === "GUEST" ? lastName : undefined,
          businessName: finalBusinessName,
          phoneNumber: userType === "HOST" ? phoneNumber : undefined,
          city: userType === "HOST" ? city : undefined,
          cuisineSpecialties: userType === "HOST"
            ? selectedCuisines.map((c) => c === "other" && customCuisine.trim() ? customCuisine.trim() : c).filter(Boolean)
            : undefined,
          description: userType === "HOST" && description.trim() ? description : undefined,
          hostSubtype: userType === "HOST" ? hostSubtype : undefined,
          ageVerified,
          // Extended host onboarding data
          experienceLevel: userType === "HOST" ? hasExperience : undefined,
          experienceDetails: userType === "HOST" && experienceDetails.trim() ? experienceDetails : undefined,
          eventTypes: userType === "HOST" ? selectedEventTypes : undefined,
          address:
            userType === "HOST"
              ? { street, apartment, postalCode, city }
              : undefined,
          nip: userType === "HOST" && hostSubtype === "business" ? nip : undefined,
          website: userType === "HOST" && hostSubtype === "business" ? website : undefined,
          contactPerson:
            userType === "HOST" && hostSubtype === "business"
              ? { name: contactPersonName, email: contactEmail, phone: contactPhone }
              : undefined,
          verificationAppointment:
            userType === "HOST" && verificationDate && verificationTimeSlot
              ? { date: verificationDate.toISOString(), timeSlot: verificationTimeSlot }
              : undefined,
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

  // ============================================
  // GUEST REGISTRATION (original simple form)
  // ============================================
  if (userType === "GUEST") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
          <CardDescription>{t("register.subtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {/* User Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType("GUEST")}
              disabled={isDisabled}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-900 transition-all"
            >
              <User className="h-6 w-6 text-amber-600" />
              <span className="font-semibold text-sm">Gość</span>
              <span className="text-xs text-center leading-tight opacity-75">
                Chcę brać udział w wydarzeniach
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType("HOST");
                setHostStep(1);
              }}
              disabled={isDisabled}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-stone-200 hover:border-stone-300 text-stone-600 transition-all"
            >
              <ChefHat className="h-6 w-6 text-stone-400" />
              <span className="font-semibold text-sm">Host</span>
              <span className="text-xs text-center leading-tight opacity-75">
                Chcę organizować wydarzenia
              </span>
            </button>
          </div>

          {/* OAuth Buttons */}
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

          {/* Guest Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")} *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 znaków"
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
                placeholder="Powtórz hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="age"
                  checked={ageVerified}
                  onCheckedChange={(checked) => setAgeVerified(checked === true)}
                  disabled={isDisabled}
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
                  disabled={isDisabled}
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
              disabled={isDisabled}
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
        </CardFooter>
      </Card>
    );
  }

  // ============================================
  // HOST REGISTRATION (multi-step)
  // ============================================
  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <ChefHat className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">Dołącz jako Host</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Podziel się swoją pasją do gotowania i zarabiaj
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-0">
          {[
            { num: 1, label: "Konto" },
            { num: 2, label: "Doświadczenie" },
            { num: 3, label: "Adres" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    hostStep > s.num
                      ? "bg-green-500 text-white"
                      : hostStep === s.num
                      ? "bg-amber-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {hostStep > s.num ? <CheckCircle className="h-4 w-4" /> : s.num}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
              </div>
              {idx < 2 && (
                <div
                  className={cn(
                    "w-16 sm:w-24 h-0.5 mx-2 mb-5",
                    hostStep > s.num ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-4">{error}</div>
      )}

      {/* ---- STEP 1: Account & Basic Info ---- */}
      {hostStep === 1 && (
        <div className="space-y-4">
          {/* Type selector to switch back */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType("GUEST")}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-stone-200 hover:border-stone-300 text-stone-600 transition-all"
            >
              <User className="h-5 w-5 text-stone-400" />
              <span className="font-semibold text-sm">Gość</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-900 transition-all"
            >
              <ChefHat className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-sm">Host</span>
            </button>
          </div>

          {/* Host Subtype */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-amber-600" />
                Kim jesteś?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHostSubtype("individual")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                    hostSubtype === "individual"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-stone-200 hover:border-stone-300 text-stone-600"
                  )}
                >
                  <User className={cn("h-5 w-5", hostSubtype === "individual" ? "text-amber-600" : "text-stone-400")} />
                  <span className="font-semibold text-sm">Osoba prywatna</span>
                  <span className="text-xs text-center opacity-75">Gotuj w domu, organizuj kolacje</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHostSubtype("business")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                    hostSubtype === "business"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-stone-200 hover:border-stone-300 text-stone-600"
                  )}
                >
                  <Building2 className={cn("h-5 w-5", hostSubtype === "business" ? "text-amber-600" : "text-stone-400")} />
                  <span className="font-semibold text-sm">Firma / Restauracja</span>
                  <span className="text-xs text-center opacity-75">Pop-upy, degustacje, wydarzenia</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Personal / Business Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {hostSubtype === "individual" ? (
                  <><User className="h-4 w-4 text-amber-600" /> Dane osobowe</>
                ) : (
                  <><Building2 className="h-4 w-4 text-amber-600" /> Dane firmy</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hostSubtype === "business" ? (
                <>
                  <div className="space-y-2">
                    <Label>Nazwa firmy / restauracji *</Label>
                    <Input
                      placeholder="np. Trattoria da Marco"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NIP</Label>
                      <Input
                        placeholder="123-456-78-90"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Strona www</Label>
                      <Input
                        placeholder="www.restauracja.pl"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">Osoba kontaktowa</p>
                  <div className="space-y-2">
                    <Label>Imię i nazwisko *</Label>
                    <Input
                      placeholder="Anna Nowak"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email kontaktowy</Label>
                      <Input
                        type="email"
                        placeholder="kontakt@restauracja.pl"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon *</Label>
                      <Input
                        type="tel"
                        placeholder="+48 123 456 789"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Imię *</Label>
                      <Input
                        placeholder="Jan"
                        value={hostFirstName}
                        onChange={(e) => setHostFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nazwisko *</Label>
                      <Input
                        placeholder="Kowalski"
                        value={hostLastName}
                        onChange={(e) => setHostLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <Phone className="inline h-3.5 w-3.5 mr-1" />
                      Telefon *
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+48 123 456 789"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account credentials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dane logowania</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hasło *</Label>
                  <Input
                    type="password"
                    placeholder="Min. 8 znaków"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Powtórz hasło *</Label>
                  <Input
                    type="password"
                    placeholder="Powtórz hasło"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="age-host"
                    checked={ageVerified}
                    onCheckedChange={(checked) => setAgeVerified(checked === true)}
                  />
                  <Label htmlFor="age-host" className="text-sm font-normal leading-tight">
                    Potwierdzam, że mam ukończone 18 lat *
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms-host"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <Label htmlFor="terms-host" className="text-sm font-normal leading-tight">
                    Akceptuję{" "}
                    <Link href="/terms" className="text-amber-600 hover:underline">regulamin</Link>{" "}
                    i{" "}
                    <Link href="/privacy" className="text-amber-600 hover:underline">politykę prywatności</Link> *
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <div />
            <Button
              onClick={() => {
                setError("");
                if (!isHostStep1Valid()) {
                  setError("Wypełnij wszystkie wymagane pola (email, hasło min. 8 znaków, dane osobowe/firmy, telefon, zgody)");
                  return;
                }
                setHostStep(2);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Dalej
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Masz już konto?{" "}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Zaloguj się
            </Link>
          </p>
        </div>
      )}

      {/* ---- STEP 2: Experience & Cuisine ---- */}
      {hostStep === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils className="h-4 w-4 text-amber-600" />
                Doświadczenie kulinarne
              </CardTitle>
              <CardDescription>Opowiedz nam o swoich umiejętnościach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Experience question */}
              <div className="space-y-3">
                <Label>Czy masz doświadczenie kulinarne? *</Label>
                <RadioGroup value={hasExperience} onValueChange={setHasExperience}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="exp-yes" />
                    <Label htmlFor="exp-yes" className="font-normal cursor-pointer">
                      Tak, gotuję hobbystycznie
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="exp-no" />
                    <Label htmlFor="exp-no" className="font-normal cursor-pointer">
                      Nie, ale chcę zacząć
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="exp-pro" />
                    <Label htmlFor="exp-pro" className="font-normal cursor-pointer">
                      Tak, jestem profesjonalistą (szef kuchni, kucharz, sommelier)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {hasExperience === "yes" && (
                <div className="space-y-2">
                  <Label>Opowiedz więcej o swoim doświadczeniu</Label>
                  <Textarea
                    placeholder="Np. gotuję od 10 lat, specjalizuję się w kuchni włoskiej..."
                    value={experienceDetails}
                    onChange={(e) => setExperienceDetails(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              <Separator />

              {/* Cuisine types */}
              <div className="space-y-3">
                <Label>Typ kuchni *</Label>
                <div className="flex flex-wrap gap-2">
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
                      onClick={() => handleCuisineToggle(cuisine.value)}
                    >
                      {cuisine.label}
                    </Badge>
                  ))}
                </div>

                {selectedCuisines.includes("other") && (
                  <div className="space-y-2 mt-2">
                    <Label>Jaka kuchnia?</Label>
                    <Input
                      placeholder="np. peruwiańska, etiopska, gruzińska..."
                      value={customCuisine}
                      onChange={(e) => setCustomCuisine(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Event types */}
              <div className="space-y-3">
                <Label>Jakie wydarzenia chcesz organizować? *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eventTypeOptions.map((type) => (
                    <div
                      key={type.value}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all",
                        selectedEventTypes.includes(type.value)
                          ? "border-amber-600 bg-amber-50"
                          : "hover:border-amber-300"
                      )}
                      onClick={() => handleEventTypeToggle(type.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.desc}</p>
                        </div>
                        {selectedEventTypes.includes(type.value) && (
                          <CheckCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Bio */}
              <div className="space-y-2">
                <Label>Krótki opis (opcjonalnie)</Label>
                <Textarea
                  placeholder="Opowiedz o sobie i swoich wydarzeniach..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setHostStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wstecz
            </Button>
            <Button
              onClick={() => {
                setError("");
                if (!isHostStep2Valid()) {
                  setError("Wybierz doświadczenie, przynajmniej jeden typ kuchni i jeden typ wydarzenia");
                  return;
                }
                setHostStep(3);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Dalej
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ---- STEP 3: Address & Submit ---- */}
      {hostStep === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Adres
              </CardTitle>
              <CardDescription>
                {hostSubtype === "individual"
                  ? "Gdzie organizujesz wydarzenia? Ten adres nie będzie widoczny publicznie."
                  : "Adres lokalu / restauracji"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ulica i numer *</Label>
                <Input
                  placeholder="ul. Przykładowa 12"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mieszkanie / lokal</Label>
                <Input
                  placeholder="np. 4A"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kod pocztowy *</Label>
                  <Input
                    placeholder="50-000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Miasto *</Label>
                  <Input value={city} disabled className="bg-muted" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Uwaga:</strong> Dokładny adres nie będzie widoczny publicznie — goście zobaczą
                go dopiero po potwierdzeniu rezerwacji.
              </div>
            </CardContent>
          </Card>

          {/* Verification Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-600" />
                Termin weryfikacji
              </CardTitle>
              <CardDescription>
                Wybierz preferowany termin krótkiej rozmowy weryfikacyjnej (ok. 15 min).
                Skontaktujemy się, żeby potwierdzić szczegóły.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block">Wybierz dzień</Label>
                  <div className="border rounded-lg p-2 inline-block">
                    <Calendar
                      mode="single"
                      selected={verificationDate}
                      onSelect={setVerificationDate}
                      locale={pl}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const day = date.getDay();
                        // Disable past dates, weekends
                        return date < today || day === 0 || day === 6;
                      }}
                      fromDate={new Date()}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block">Przedział godzinowy</Label>
                  <div className="space-y-2">
                    {[
                      { value: "morning", label: "Rano", time: "9:00 – 12:00", icon: "🌅" },
                      { value: "afternoon", label: "Popołudnie", time: "12:00 – 16:00", icon: "☀️" },
                      { value: "evening", label: "Wieczór", time: "16:00 – 19:00", icon: "🌆" },
                    ].map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setVerificationTimeSlot(slot.value)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                          verificationTimeSlot === slot.value
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-stone-200 hover:border-stone-300 text-stone-600"
                        )}
                      >
                        <span className="text-lg">{slot.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{slot.label}</p>
                          <p className="text-xs opacity-75 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {slot.time}
                          </p>
                        </div>
                        {verificationTimeSlot === slot.value && (
                          <CheckCircle className="h-4 w-4 text-amber-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {verificationDate && verificationTimeSlot && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <strong>Wybrany termin:</strong>{" "}
                  {verificationDate.toLocaleDateString("pl-PL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  {", "}
                  {verificationTimeSlot === "morning" && "9:00 – 12:00"}
                  {verificationTimeSlot === "afternoon" && "12:00 – 16:00"}
                  {verificationTimeSlot === "evening" && "16:00 – 19:00"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Podsumowanie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Typ konta</span>
                <span className="font-medium">
                  {hostSubtype === "business" ? "Firma / Restauracja" : "Osoba prywatna"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kuchnia</span>
                <span className="font-medium">
                  {selectedCuisines.map((c) => {
                    if (c === "other" && customCuisine.trim()) return customCuisine.trim();
                    return cuisineOptions.find((o) => o.value === c)?.label;
                  }).join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Typy wydarzeń</span>
                <span className="font-medium">
                  {selectedEventTypes.map((e) => eventTypeOptions.find((o) => o.value === e)?.label).join(", ")}
                </span>
              </div>

              {verificationDate && verificationTimeSlot && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weryfikacja</span>
                  <span className="font-medium">
                    {verificationDate.toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "long",
                    })}
                    {", "}
                    {verificationTimeSlot === "morning" && "9:00–12:00"}
                    {verificationTimeSlot === "afternoon" && "12:00–16:00"}
                    {verificationTimeSlot === "evening" && "16:00–19:00"}
                  </span>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4 text-sm text-green-800">
                <p className="font-medium mb-1">Co dalej?</p>
                <p>Po rejestracji wyślemy Ci email weryfikacyjny. Kliknij w link, zaloguj się i twórz wydarzenia!</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setHostStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wstecz
            </Button>
            <Button
              onClick={() => {
                setError("");
                if (!isHostStep3Valid()) {
                  setError("Podaj ulicę i kod pocztowy");
                  return;
                }
                handleSubmit();
              }}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tworzenie konta...
                </>
              ) : (
                <>
                  Stwórz konto hosta
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
