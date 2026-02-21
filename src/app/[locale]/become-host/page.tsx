"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  User,
  MapPin,
  Camera,
  CalendarDays,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Utensils,
  Clock,
  Star,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cuisineKeys = [
  "polish", "italian", "french", "asian", "japanese", "indian",
  "mexican", "mediterranean", "middle-eastern", "american",
  "vegan", "vegetarian", "fusion", "pastry", "wine", "other"
];

const eventTypeKeys = [
  "supper-club", "cooking-class", "tasting", "popup", "active-food"
];

const neighborhoodKeys = [
  "stare-miasto", "nadodrze", "srodmiescie", "krzyki",
  "fabryczna", "psie-pole", "biskupin", "olbin", "other"
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export default function BecomeHostPage() {
  const t = useTranslations("becomeHostPage");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Host type selection
  const [hostType, setHostType] = useState<"individual" | "restaurant">("individual");

  // Step 1: Personal info (for individual)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Step 1: Restaurant info (for restaurant)
  const [restaurantName, setRestaurantName] = useState("");
  const [nip, setNip] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPosition, setContactPosition] = useState("");

  // Step 4: Logo (for restaurant)
  const [logo, setLogo] = useState<string | null>(null);

  // Step 2: Address
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Wrocław");
  const [postalCode, setPostalCode] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // Step 3: Experience & cuisine
  const [hasExperience, setHasExperience] = useState<string>("");
  const [experienceDetails, setExperienceDetails] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  // Step 4: Photos (simulated)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [foodPhotos, setFoodPhotos] = useState<string[]>([]);

  // Step 5: Availability
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToVerification, setAgreeToVerification] = useState(false);

  const totalSteps = 5;

  // Validation
  const isStep1Valid = hostType === "individual"
    ? (firstName.length >= 2 &&
       lastName.length >= 2 &&
       email.includes("@") &&
       phone.length >= 9 &&
       birthDate)
    : (restaurantName.length >= 2 &&
       contactPersonName.length >= 3 &&
       contactEmail.includes("@") &&
       contactPhone.length >= 9);

  const isStep2Valid =
    street.length >= 3 &&
    city.length >= 2 &&
    postalCode.length >= 5 &&
    neighborhood;

  const isStep3Valid =
    hasExperience !== "" &&
    selectedCuisines.length > 0 &&
    selectedEventTypes.length > 0 &&
    bio.length >= 50;

  const isStep4Valid = hostType === "individual"
    ? profilePhoto !== null
    : logo !== null;

  const isStep5Valid =
    selectedDates.length > 0 &&
    preferredTimes.length > 0 &&
    agreeToTerms &&
    agreeToVerification;

  const canProceed = () => {
    switch (step) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      case 5:
        return isStep5Valid;
      default:
        return false;
    }
  };

  const handleCuisineToggle = (value: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  };

  const handleEventTypeToggle = (value: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(value)
        ? prev.filter((e) => e !== value)
        : [...prev, value]
    );
  };

  const handleTimeToggle = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const simulatePhotoUpload = (type: "profile" | "food" | "logo") => {
    // Simulate upload with placeholder
    if (type === "profile") {
      setProfilePhoto("uploaded");
    } else if (type === "logo") {
      setLogo("uploaded");
    } else {
      if (foodPhotos.length < 5) {
        setFoodPhotos([...foodPhotos, `food-${foodPhotos.length + 1}`]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!isStep5Valid) return;

    setIsSubmitting(true);

    try {
      const businessNameValue = hostType === "restaurant" ? restaurantName : `${firstName} ${lastName}`;
      const phoneValue = hostType === "restaurant" ? contactPhone : phone;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          becomeHost: true,
          businessName: businessNameValue,
          description: bio || null,
          phoneNumber: phoneValue || null,
          city: city || "Wrocław",
          neighborhood: neighborhood || null,
          cuisineSpecialties: selectedCuisines,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create host profile");
      }

      router.push("/become-host/success");
    } catch (error) {
      console.error("Become host error:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("header.title")}</h1>
            <p className="text-muted-foreground">
              {t("header.subtitle")}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                      step > s
                        ? "bg-green-500 text-white"
                        : step === s
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  {s < 5 && (
                    <div
                      className={cn(
                        "w-12 sm:w-20 h-1 mx-1",
                        step > s ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("progress.data")}</span>
              <span>{t("progress.address")}</span>
              <span>{t("progress.experience")}</span>
              <span>{t("progress.photos")}</span>
              <span>{t("progress.schedule")}</span>
            </div>
          </div>

          {/* Step 1: Host Type & Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Host Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-amber-600" />
                    {t("hostType.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("hostType.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={hostType}
                    onValueChange={(value) => setHostType(value as "individual" | "restaurant")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all",
                        hostType === "individual"
                          ? "border-amber-500 bg-amber-50"
                          : "border-muted hover:border-amber-200"
                      )}
                      onClick={() => setHostType("individual")}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="individual" id="individual" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-5 w-5 text-amber-600" />
                            <Label htmlFor="individual" className="font-semibold cursor-pointer">
                              {t("hostType.individual")}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("hostType.individualDesc")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "border-2 rounded-xl p-4 cursor-pointer transition-all",
                        hostType === "restaurant"
                          ? "border-amber-500 bg-amber-50"
                          : "border-muted hover:border-amber-200"
                      )}
                      onClick={() => setHostType("restaurant")}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="restaurant" id="restaurant" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-amber-600" />
                            <Label htmlFor="restaurant" className="font-semibold cursor-pointer">
                              {t("hostType.restaurant")}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("hostType.restaurantDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Personal Info (Individual) */}
              {hostType === "individual" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-amber-600" />
                      {t("personalInfo.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("personalInfo.subtitle")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t("personalInfo.firstName")} *</Label>
                        <Input
                          id="firstName"
                          placeholder="Jan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t("personalInfo.lastName")} *</Label>
                        <Input
                          id="lastName"
                          placeholder="Kowalski"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t("personalInfo.email")} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("personalInfo.phone")} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+48 123 456 789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">{t("personalInfo.birthDate")} *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("personalInfo.birthDateHint")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Restaurant Info */}
              {hostType === "restaurant" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-amber-600" />
                      {t("restaurantInfo.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("restaurantInfo.subtitle")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">{t("restaurantInfo.name")} *</Label>
                      <Input
                        id="restaurantName"
                        placeholder="Restauracja Smaki Świata"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nip">{t("restaurantInfo.nip")}</Label>
                        <Input
                          id="nip"
                          placeholder="123-456-78-90"
                          value={nip}
                          onChange={(e) => setNip(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">{t("restaurantInfo.website")}</Label>
                        <Input
                          id="website"
                          placeholder="www.restauracja.pl"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("restaurantInfo.contactPerson")}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPersonName">{t("restaurantInfo.contactName")} *</Label>
                      <Input
                        id="contactPersonName"
                        placeholder="Anna Nowak"
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">{t("restaurantInfo.contactEmail")} *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="kontakt@restauracja.pl"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">{t("restaurantInfo.contactPhone")} *</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+48 123 456 789"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPosition">{t("restaurantInfo.contactPosition")}</Label>
                      <Input
                        id="contactPosition"
                        placeholder={t("restaurantInfo.contactPositionPlaceholder")}
                        value={contactPosition}
                        onChange={(e) => setContactPosition(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  {t("address.title")}
                </CardTitle>
                <CardDescription>
                  {t("address.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">{t("address.street")} *</Label>
                  <Input
                    id="street"
                    placeholder="ul. Przykładowa 12"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment">{t("address.apartment")}</Label>
                  <Input
                    id="apartment"
                    placeholder="np. 4A"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t("address.postalCode")} *</Label>
                    <Input
                      id="postalCode"
                      placeholder="50-000"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("address.city")} *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">{t("address.neighborhood")} *</Label>
                  <Select value={neighborhood} onValueChange={setNeighborhood}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("address.neighborhoodPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {neighborhoodKeys.map((key) => (
                        <SelectItem key={key} value={key}>
                          {t(`address.neighborhoods.${key}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p>
                    <strong>{t("address.notice").split(":")[0]}:</strong>
                    {t("address.notice").split(":").slice(1).join(":")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Experience & Cuisine */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-amber-600" />
                  {t("experience.title")}
                </CardTitle>
                <CardDescription>
                  {t("experience.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Experience question */}
                <div className="space-y-3">
                  <Label>{t("experience.hasExperience")} *</Label>
                  <RadioGroup value={hasExperience} onValueChange={setHasExperience}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="exp-yes" />
                      <Label htmlFor="exp-yes" className="font-normal cursor-pointer">
                        {t("experience.experienceYes")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="exp-no" />
                      <Label htmlFor="exp-no" className="font-normal cursor-pointer">
                        {t("experience.experienceNo")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="exp-pro" />
                      <Label htmlFor="exp-pro" className="font-normal cursor-pointer">
                        {t("experience.experiencePro")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {hasExperience === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="expDetails">{t("experience.experienceDetails")}</Label>
                    <Textarea
                      id="expDetails"
                      placeholder={t("experience.experienceDetailsPlaceholder")}
                      value={experienceDetails}
                      onChange={(e) => setExperienceDetails(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <Separator />

                {/* Cuisine types */}
                <div className="space-y-3">
                  <Label>{t("experience.cuisines")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {cuisineKeys.map((cuisine) => (
                      <Badge
                        key={cuisine}
                        variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          selectedCuisines.includes(cuisine)
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "hover:bg-amber-50"
                        )}
                        onClick={() => handleCuisineToggle(cuisine)}
                      >
                        {t(`experience.cuisineTypes.${cuisine}`)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Event types */}
                <div className="space-y-3">
                  <Label>{t("experience.eventTypes")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {eventTypeKeys.map((type) => (
                      <div
                        key={type}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer transition-all",
                          selectedEventTypes.includes(type)
                            ? "border-amber-600 bg-amber-50"
                            : "hover:border-amber-300"
                        )}
                        onClick={() => handleEventTypeToggle(type)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{t(`experience.eventTypeOptions.${type}.label`)}</p>
                            <p className="text-xs text-muted-foreground">
                              {t(`experience.eventTypeOptions.${type}.description`)}
                            </p>
                          </div>
                          {selectedEventTypes.includes(type) && (
                            <CheckCircle className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {t("experience.bio")} *
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder={t("experience.bioPlaceholder")}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("experience.bioHint")}</span>
                    <span className={bio.length >= 50 ? "text-green-600" : ""}>
                      {bio.length}/50
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-amber-600" />
                  {t("photos.title")}
                </CardTitle>
                <CardDescription>
                  {hostType === "individual"
                    ? t("photos.subtitleIndividual")
                    : t("photos.subtitleRestaurant")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile photo (Individual) */}
                {hostType === "individual" && (
                  <div className="space-y-3">
                    <Label>{t("photos.profilePhoto")} *</Label>
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center",
                          profilePhoto
                            ? "border-green-500 bg-green-50"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {profilePhoto ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => simulatePhotoUpload("profile")}
                          disabled={profilePhoto !== null}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {profilePhoto ? t("photos.changePhoto") : t("photos.addPhoto")}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {t("photos.photoHint")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo (Restaurant) */}
                {hostType === "restaurant" && (
                  <div className="space-y-3">
                    <Label>{t("photos.logo")} *</Label>
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center",
                          logo
                            ? "border-green-500 bg-green-50"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {logo ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => simulatePhotoUpload("logo")}
                          disabled={logo !== null}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {logo ? t("photos.changeLogo") : t("photos.addLogo")}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {t("photos.logoHint")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Food photos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      {hostType === "individual"
                        ? t("photos.foodPhotosIndividual")
                        : t("photos.foodPhotosRestaurant")}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {foodPhotos.length}/5
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {foodPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg border-2 border-green-500 bg-green-50 flex items-center justify-center relative"
                      >
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <button
                          type="button"
                          onClick={() =>
                            setFoodPhotos(foodPhotos.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {foodPhotos.length < 5 && (
                      <button
                        type="button"
                        onClick={() => simulatePhotoUpload("food")}
                        className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <span className="text-xs text-muted-foreground">{t("photos.add")}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hostType === "individual"
                      ? t("photos.foodPhotosHintIndividual")
                      : t("photos.foodPhotosHintRestaurant")}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Star className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">{t("photos.tip")}</p>
                      <p>
                        {hostType === "individual"
                          ? t("photos.tipTextIndividual")
                          : t("photos.tipTextRestaurant")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Availability */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                  {t("schedule.title")}
                </CardTitle>
                <CardDescription>
                  {t("schedule.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div className="space-y-3">
                  <Label>{t("schedule.selectDays")}</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={(dates) => setSelectedDates(dates || [])}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  {selectedDates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date) => (
                        <Badge key={date.toISOString()} variant="secondary">
                          {date.toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "short",
                          })}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDates(
                                selectedDates.filter(
                                  (d) => d.toISOString() !== date.toISOString()
                                )
                              )
                            }
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Time slots */}
                <div className="space-y-3">
                  <Label>{t("schedule.selectTimes")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((time) => (
                      <Badge
                        key={time}
                        variant={preferredTimes.includes(time) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer",
                          preferredTimes.includes(time)
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "hover:bg-amber-50"
                        )}
                        onClick={() => handleTimeToggle(time)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Agreements */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) =>
                        setAgreeToTerms(checked as boolean)
                      }
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      {t.rich("schedule.terms", {
                        terms: (chunks) => <a href="/terms" className="text-amber-600 underline">{chunks}</a>,
                        privacy: (chunks) => <a href="/privacy" className="text-amber-600 underline">{chunks}</a>
                      })} *
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="verification"
                      checked={agreeToVerification}
                      onCheckedChange={(checked) =>
                        setAgreeToVerification(checked as boolean)
                      }
                    />
                    <label htmlFor="verification" className="text-sm cursor-pointer">
                      {t("schedule.verification")} *
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">{t("schedule.whatNext")}</p>
                      <p>
                        {t("schedule.whatNextText")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("buttons.back")}
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {t("buttons.next")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t("buttons.submitting")}
                  </>
                ) : (
                  <>
                    {t("buttons.submit")}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
