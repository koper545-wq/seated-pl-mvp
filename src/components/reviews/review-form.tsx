"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  eventId: string;
  eventTitle: string;
  hostName: string;
  onSubmit?: (review: ReviewFormData) => void;
  onCancel?: () => void;
}

export interface ReviewFormData {
  eventId: string;
  overallRating: number;
  foodRating: number;
  communicationRating: number;
  valueRating: number;
  ambianceRating: number;
  text: string;
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
}

function StarRating({ value, onChange, label, description }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= (hoverValue || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 hover:text-amber-200"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground self-center">
          {value > 0 ? `${value}/5` : ""}
        </span>
      </div>
    </div>
  );
}

export function ReviewForm({
  eventId,
  eventTitle,
  hostName,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [ambianceRating, setAmbianceRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    overallRating > 0 &&
    foodRating > 0 &&
    communicationRating > 0 &&
    valueRating > 0 &&
    ambianceRating > 0 &&
    text.length >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const reviewData: ReviewFormData = {
      eventId,
      overallRating,
      foodRating,
      communicationRating,
      valueRating,
      ambianceRating,
      text,
    };

    onSubmit?.(reviewData);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-green-600 fill-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Dziękujemy za opinię!
          </h3>
          <p className="text-green-700">
            Twoja opinia została dodana i pomoże innym użytkownikom w wyborze
            wydarzeń.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Oceń wydarzenie &quot;{eventTitle}&quot;
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Podziel się swoją opinią o wydarzeniu z hostem {hostName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall rating - prominent */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              label="Ocena ogólna"
              description="Wymagane"
            />
          </div>

          {/* Detailed ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StarRating
              value={foodRating}
              onChange={setFoodRating}
              label="Jedzenie"
            />
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Komunikacja"
            />
            <StarRating
              value={valueRating}
              onChange={setValueRating}
              label="Stosunek jakości do ceny"
            />
            <StarRating
              value={ambianceRating}
              onChange={setAmbianceRating}
              label="Atmosfera"
            />
          </div>

          {/* Review text */}
          <div className="space-y-2">
            <Label htmlFor="review-text">Twoja opinia</Label>
            <Textarea
              id="review-text"
              placeholder="Opisz swoje doświadczenie... Co Ci się podobało? Co można poprawić?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 20 znaków</span>
              <span
                className={cn(
                  text.length < 20 ? "text-red-500" : "text-green-600"
                )}
              >
                {text.length}/20
              </span>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Wyślij opinię
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
