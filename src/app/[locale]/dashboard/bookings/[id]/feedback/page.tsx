"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Star,
  Send,
  CheckCircle,
  Camera,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockEvents } from "@/lib/mock-data";

// Rating categories for guests reviewing events/hosts
const ratingCategories = [
  { id: "food", labelKey: "food", emoji: "🍽️" },
  { id: "atmosphere", labelKey: "atmosphere", emoji: "✨" },
  { id: "communication", labelKey: "communication", emoji: "💬" },
  { id: "value", labelKey: "value", emoji: "💰" },
  { id: "overall", labelKey: "overall", emoji: "⭐" },
];

const highlightOptions = [
  { id: "delicious-food", labelKey: "deliciousFood", emoji: "😋" },
  { id: "great-host", labelKey: "greatHost", emoji: "🙌" },
  { id: "beautiful-setting", labelKey: "beautifulSetting", emoji: "🏡" },
  { id: "learned-something", labelKey: "learnedSomething", emoji: "📚" },
  { id: "met-cool-people", labelKey: "metCoolPeople", emoji: "👥" },
  { id: "worth-the-price", labelKey: "worthThePrice", emoji: "💎" },
  { id: "would-return", labelKey: "wouldReturn", emoji: "🔄" },
  { id: "instagram-worthy", labelKey: "instagramWorthy", emoji: "📸" },
];

function StarRating({
  value,
  onChange,
  size = "default",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: "default" | "large";
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={cn(
            "transition-transform hover:scale-110",
            size === "large" ? "text-3xl" : "text-2xl"
          )}
        >
          <Star
            className={cn(
              size === "large" ? "h-8 w-8" : "h-6 w-6",
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-stone-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function GuestFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("feedback");
  const bookingId = params.id as string;

  // Mock: find the event for this booking
  const event = mockEvents[0]; // In real app, fetch based on bookingId

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Ratings state
  const [ratings, setRatings] = useState<Record<string, number>>({
    food: 0,
    atmosphere: 0,
    communication: 0,
    value: 0,
    overall: 0,
  });

  // Highlights state
  const [highlights, setHighlights] = useState<string[]>([]);

  // Review text
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Photo upload (mock)
  const [photos, setPhotos] = useState<string[]>([]);

  const handleRatingChange = (category: string, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleHighlightToggle = (highlightId: string) => {
    setHighlights((prev) =>
      prev.includes(highlightId)
        ? prev.filter((h) => h !== highlightId)
        : [...prev, highlightId]
    );
  };

  const handlePhotoUpload = () => {
    if (photos.length < 3) {
      setPhotos([...photos, `photo-${photos.length + 1}`]);
    }
  };

  const isStep1Valid = Object.values(ratings).every((r) => r > 0);
  const isStep2Valid = reviewText.length >= 10;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In real app, send to API

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-4">
              {t("submitted.title")}
            </h1>
            <p className="text-stone-600 mb-8">{t("submitted.description")}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <p className="text-amber-800 text-sm">
                🎉 {t("submitted.xpEarned", { xp: 50 })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard/bookings">{t("submitted.viewBookings")}</Link>
              </Button>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/events">{t("submitted.browseEvents")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToBookings")}
            </Link>
            <h1 className="text-2xl font-bold">{t("guest.title")}</h1>
            <p className="text-muted-foreground">{t("guest.subtitle")}</p>
          </div>

          {/* Event info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${event.imageGradient} flex items-center justify-center text-2xl`}
                >
                  🍽️
                </div>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("guest.hostedBy", { name: event.host.name })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.dateFormatted}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-2 rounded-full transition-colors",
                  step >= s ? "bg-amber-500" : "bg-stone-200"
                )}
              />
            ))}
          </div>

          {/* Step 1: Ratings */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  {t("guest.step1.title")}
                </CardTitle>
                <CardDescription>{t("guest.step1.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {ratingCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.emoji}</span>
                      <span className="font-medium">
                        {t(`guest.categories.${category.labelKey}`)}
                      </span>
                    </div>
                    <StarRating
                      value={ratings[category.id]}
                      onChange={(value) => handleRatingChange(category.id, value)}
                    />
                  </div>
                ))}

                <div className="pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {t("continue")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Highlights & Review */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-amber-500" />
                  {t("guest.step2.title")}
                </CardTitle>
                <CardDescription>{t("guest.step2.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Highlights */}
                <div>
                  <Label className="mb-3 block">{t("guest.highlights.label")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {highlightOptions.map((option) => (
                      <Badge
                        key={option.id}
                        variant={highlights.includes(option.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer py-2 px-3 text-sm",
                          highlights.includes(option.id)
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "hover:bg-amber-50"
                        )}
                        onClick={() => handleHighlightToggle(option.id)}
                      >
                        <span className="mr-1">{option.emoji}</span>
                        {t(`guest.highlights.${option.labelKey}`)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Review text */}
                <div>
                  <Label htmlFor="review">{t("guest.review.label")}</Label>
                  <Textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t("guest.review.placeholder")}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("guest.review.hint", { min: 10 })} ({reviewText.length}/10)
                  </p>
                </div>

                {/* Public toggle */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                  />
                  <label htmlFor="public" className="text-sm cursor-pointer">
                    {t("guest.review.public")}
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    {t("back")}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {t("continue")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Photos (optional) & Submit */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-amber-500" />
                  {t("guest.step3.title")}
                </CardTitle>
                <CardDescription>{t("guest.step3.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo upload */}
                <div>
                  <Label className="mb-3 block">{t("guest.photos.label")}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg border-2 border-green-500 bg-green-50 flex items-center justify-center"
                      >
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    ))}
                    {photos.length < 3 && (
                      <button
                        type="button"
                        onClick={handlePhotoUpload}
                        className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
                      >
                        <Camera className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {t("guest.photos.add")}
                        </span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("guest.photos.hint")}
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">{t("guest.summary.title")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("guest.summary.overallRating")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {ratings.overall}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("guest.summary.highlights")}
                      </span>
                      <span>{highlights.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("guest.summary.photos")}
                      </span>
                      <span>{photos.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    {t("back")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t("submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t("submit")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
