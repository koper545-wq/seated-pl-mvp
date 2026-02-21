"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import { MockReview } from "@/lib/mock-data";
import { MessageSquare, PenLine } from "lucide-react";

interface ReviewsSectionProps {
  reviews: MockReview[];
  eventId: string;
  eventTitle: string;
  hostName: string;
  canReview?: boolean; // User attended and hasn't reviewed yet
}

export function ReviewsSection({
  reviews,
  eventId,
  eventTitle,
  hostName,
  canReview = true, // For demo purposes, always show
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-600" />
          Opinie o tym hoście ({reviews.length})
        </h2>
        {canReview && !showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Napisz opinię
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            eventId={eventId}
            eventTitle={eventTitle}
            hostName={hostName}
            onSubmit={(data) => {
              // In real app, this would send to API
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Reviews list */}
      <ReviewList
        reviews={reviews}
        showEventTitle={true}
        showRatingSummary={reviews.length >= 3}
      />
    </div>
  );
}
