import { api } from "./client";
import type { ApiReview, ReviewsResponse } from "./types";

export async function fetchEventReviews(eventId: string): Promise<ReviewsResponse> {
  return api.get<ReviewsResponse>(`/reviews/event/${eventId}`);
}

export async function createReview(data: {
  eventId: string;
  overallRating: number;
  foodRating?: number;
  communicationRating?: number;
  valueRating?: number;
  ambianceRating?: number;
  text?: string;
  photos?: string[];
}): Promise<ApiReview> {
  return api.post<ApiReview>("/reviews", data);
}
