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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Star,
  Send,
  CheckCircle,
  Users,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { mockEvents } from "@/lib/mock-data";

// Mock guests for this event
const mockGuests = [
  {
    id: "guest-1",
    name: "Anna Nowak",
    avatar: "",
    attended: true,
    dietaryRequests: "Wegetarianka",
  },
  {
    id: "guest-2",
    name: "Piotr Kowalski",
    avatar: "",
    attended: true,
    dietaryRequests: null,
  },
  {
    id: "guest-3",
    name: "Maria Wiśniewska",
    avatar: "",
    attended: true,
    dietaryRequests: "Bez glutenu",
  },
  {
    id: "guest-4",
    name: "Jan Dąbrowski",
    avatar: "",
    attended: false,
    dietaryRequests: null,
  },
];

// Rating categories for hosts reviewing guests
const guestRatingCategories = [
  { id: "punctuality", labelKey: "punctuality", emoji: "⏰" },
  { id: "respect", labelKey: "respect", emoji: "🤝" },
  { id: "engagement", labelKey: "engagement", emoji: "💬" },
  { id: "overall", labelKey: "overall", emoji: "⭐" },
];

// Quick tags for guests
const guestTags = {
  positive: [
    { id: "great-guest", labelKey: "greatGuest", emoji: "🌟" },
    { id: "friendly", labelKey: "friendly", emoji: "😊" },
    { id: "engaged", labelKey: "engaged", emoji: "🎯" },
    { id: "helpful", labelKey: "helpful", emoji: "🙌" },
    { id: "punctual", labelKey: "punctual", emoji: "⏰" },
    { id: "would-host-again", labelKey: "wouldHostAgain", emoji: "✅" },
  ],
  concerns: [
    { id: "late", labelKey: "late", emoji: "⏱️" },
    { id: "no-show", labelKey: "noShow", emoji: "❌" },
    { id: "dietary-issues", labelKey: "dietaryIssues", emoji: "🍽️" },
    { id: "disruptive", labelKey: "disruptive", emoji: "⚠️" },
  ],
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
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
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-5 w-5",
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

interface GuestFeedback {
  guestId: string;
  ratings: Record<string, number>;
  positiveTags: string[];
  concernTags: string[];
  privateNote: string;
}

export default function HostFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("feedback");
  const eventId = params.id as string;

  // Mock: find the event
  const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];
  const attendedGuests = mockGuests.filter((g) => g.attended);

  const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Feedback for each guest
  const [guestFeedbacks, setGuestFeedbacks] = useState<Record<string, GuestFeedback>>(
    () => {
      const initial: Record<string, GuestFeedback> = {};
      attendedGuests.forEach((guest) => {
        initial[guest.id] = {
          guestId: guest.id,
          ratings: { punctuality: 0, respect: 0, engagement: 0, overall: 0 },
          positiveTags: [],
          concernTags: [],
          privateNote: "",
        };
      });
      return initial;
    }
  );

  // Event-level feedback
  const [eventNotes, setEventNotes] = useState("");

  const currentGuest = attendedGuests[currentGuestIndex];
  const currentFeedback = guestFeedbacks[currentGuest?.id];

  const updateCurrentFeedback = (updates: Partial<GuestFeedback>) => {
    if (!currentGuest) return;
    setGuestFeedbacks((prev) => ({
      ...prev,
      [currentGuest.id]: { ...prev[currentGuest.id], ...updates },
    }));
  };

  const handleRatingChange = (category: string, value: number) => {
    updateCurrentFeedback({
      ratings: { ...currentFeedback.ratings, [category]: value },
    });
  };

  const handleTagToggle = (tagId: string, type: "positive" | "concern") => {
    const key = type === "positive" ? "positiveTags" : "concernTags";
    const current = currentFeedback[key];
    updateCurrentFeedback({
      [key]: current.includes(tagId)
        ? current.filter((t) => t !== tagId)
        : [...current, tagId],
    });
  };

  const isCurrentGuestComplete = Object.values(currentFeedback?.ratings || {}).every(
    (r) => r > 0
  );

  const allGuestsComplete = attendedGuests.every((guest) =>
    Object.values(guestFeedbacks[guest.id]?.ratings || {}).every((r) => r > 0)
  );

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
              {t("submitted.hostTitle")}
            </h1>
            <p className="text-stone-600 mb-8">
              {t("submitted.hostDescription")}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                ℹ️ {t("submitted.privateNote")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard/host">{t("submitted.viewDashboard")}</Link>
              </Button>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/dashboard/host/events/new">
                  {t("submitted.createEvent")}
                </Link>
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
              href="/dashboard/host"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToPanel")}
            </Link>
            <h1 className="text-2xl font-bold">{t("host.title")}</h1>
            <p className="text-muted-foreground">{t("host.subtitle")}</p>
          </div>

          {/* Event info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${event.imageGradient} flex items-center justify-center text-xl`}
                  >
                    🍽️
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.dateFormatted}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {attendedGuests.length} {t("host.guestsAttended")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Guest selector / progress */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {attendedGuests.map((guest, index) => {
              const feedback = guestFeedbacks[guest.id];
              const isComplete = Object.values(feedback?.ratings || {}).every(
                (r) => r > 0
              );
              const initials = getInitials(guest.name);

              return (
                <button
                  key={guest.id}
                  onClick={() => setCurrentGuestIndex(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors flex-shrink-0",
                    index === currentGuestIndex
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 hover:bg-stone-50"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        isComplete
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-700"
                      )}
                    >
                      {isComplete ? "✓" : initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {guest.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current guest feedback */}
          {currentGuest && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-stone-100 text-stone-700">
                        {getInitials(currentGuest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{currentGuest.name}</CardTitle>
                      {currentGuest.dietaryRequests && (
                        <CardDescription>
                          🍽️ {currentGuest.dietaryRequests}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {currentGuestIndex + 1} / {attendedGuests.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ratings */}
                <div>
                  <Label className="mb-3 block">{t("host.ratings.label")}</Label>
                  <div className="space-y-3">
                    {guestRatingCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span className="text-sm">
                            {t(`host.categories.${category.labelKey}`)}
                          </span>
                        </div>
                        <StarRating
                          value={currentFeedback.ratings[category.id]}
                          onChange={(value) =>
                            handleRatingChange(category.id, value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positive tags */}
                <div>
                  <Label className="mb-3 block flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    {t("host.tags.positive")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {guestTags.positive.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={
                          currentFeedback.positiveTags.includes(tag.id)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer py-1.5",
                          currentFeedback.positiveTags.includes(tag.id)
                            ? "bg-green-600 hover:bg-green-700"
                            : "hover:bg-green-50 hover:border-green-300"
                        )}
                        onClick={() => handleTagToggle(tag.id, "positive")}
                      >
                        {tag.emoji} {t(`host.tags.${tag.labelKey}`)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Concern tags */}
                <div>
                  <Label className="mb-3 block flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    {t("host.tags.concerns")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {guestTags.concerns.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={
                          currentFeedback.concernTags.includes(tag.id)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer py-1.5",
                          currentFeedback.concernTags.includes(tag.id)
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "hover:bg-amber-50 hover:border-amber-300"
                        )}
                        onClick={() => handleTagToggle(tag.id, "concern")}
                      >
                        {tag.emoji} {t(`host.tags.${tag.labelKey}`)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Private note */}
                <div>
                  <Label htmlFor="privateNote">{t("host.privateNote.label")}</Label>
                  <Textarea
                    id="privateNote"
                    value={currentFeedback.privateNote}
                    onChange={(e) =>
                      updateCurrentFeedback({ privateNote: e.target.value })
                    }
                    placeholder={t("host.privateNote.placeholder")}
                    rows={2}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("host.privateNote.hint")}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentGuestIndex(Math.max(0, currentGuestIndex - 1))
                    }
                    disabled={currentGuestIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("previous")}
                  </Button>
                  {currentGuestIndex < attendedGuests.length - 1 ? (
                    <Button
                      onClick={() => setCurrentGuestIndex(currentGuestIndex + 1)}
                      disabled={!isCurrentGuestComplete}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {t("next")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground flex items-center">
                      {t("host.lastGuest")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event notes & submit */}
          <Card>
            <CardHeader>
              <CardTitle>{t("host.eventNotes.title")}</CardTitle>
              <CardDescription>{t("host.eventNotes.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder={t("host.eventNotes.placeholder")}
                rows={3}
              />

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">{t("host.summary.title")}</h4>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    {t("host.summary.guestsRated", {
                      rated: Object.values(guestFeedbacks).filter((f) =>
                        Object.values(f.ratings).every((r) => r > 0)
                      ).length,
                      total: attendedGuests.length,
                    })}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!allGuestsComplete || isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t("host.submitAll")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
