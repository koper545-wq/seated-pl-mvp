import { api } from "./client";
import type { ApiUser } from "./types";

export async function fetchProfile(): Promise<ApiUser> {
  return api.get<ApiUser>("/profile");
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  language?: string;
  businessName?: string;
  description?: string;
  phoneNumber?: string;
  city?: string;
  neighborhood?: string;
  cuisineSpecialties?: string[];
}): Promise<ApiUser> {
  return api.patch<ApiUser>("/profile", data);
}

export async function fetchPublicProfile(id: string) {
  return api.get<ApiUser>(`/profile/${id}`);
}
