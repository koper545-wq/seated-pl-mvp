"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { mockUsers, type MockUser } from "@/lib/mock-data";

const MOCK_USER_KEY = "seated-mock-user";
const ACTIVE_MODE_KEY = "seated-active-mode";

export type ActiveMode = "host" | "guest";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  userType: string;
  guestProfile?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    dietaryRestrictions: string[];
    allergies: string[];
    xp: number;
  } | null;
  hostProfile?: {
    id: string;
    businessName: string;
    description: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    city: string;
    neighborhood: string | null;
    cuisineSpecialties: string[];
    verified: boolean;
  } | null;
}

export interface CurrentUserState {
  // Backwards-compatible with useMockUser()
  user: MockUser | UserProfile | null;
  activeMode: ActiveMode;
  isLoading: boolean;
  canSwitchMode: boolean;
  switchMode: (mode: ActiveMode) => void;
  effectiveRole: "host" | "guest";
  // New fields for API data
  isAuthenticated: boolean;
  isMockUser: boolean;
  userId: string | null;
  guestProfile: UserProfile["guestProfile"] | null;
  hostProfile: UserProfile["hostProfile"] | null;
}

export function useCurrentUser(): CurrentUserState {
  const { data: session, status } = useSession();
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>("guest");
  const [apiProfile, setApiProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetched, setProfileFetched] = useState(false);

  // 1. Check for mock user in localStorage (dev mode)
  useEffect(() => {
    const stored = localStorage.getItem(MOCK_USER_KEY);
    const storedMode = localStorage.getItem(ACTIVE_MODE_KEY) as ActiveMode | null;

    if (stored) {
      const user = mockUsers.find((u) => u.id === stored);
      if (user) {
        setMockUser(user);
        if (storedMode && (storedMode === "host" || storedMode === "guest")) {
          setActiveMode(storedMode);
        } else {
          setActiveMode(user.role === "host" ? "host" : "guest");
        }
        setIsLoading(false);
        return;
      }
    }

    // No mock user — wait for session
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  // 2. Fetch profile from API if real session exists and no mock user
  useEffect(() => {
    if (mockUser || status === "loading" || !session?.user?.id || profileFetched) return;

    setProfileFetched(true);
    fetch("/api/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setApiProfile({
            id: data.id,
            email: data.email,
            name:
              data.guestProfile
                ? [data.guestProfile.firstName, data.guestProfile.lastName].filter(Boolean).join(" ") || data.email
                : data.hostProfile?.businessName || data.email,
            image: data.guestProfile?.avatarUrl || data.hostProfile?.avatarUrl || null,
            userType: data.userType,
            guestProfile: data.guestProfile || null,
            hostProfile: data.hostProfile || null,
          });

          // Set mode based on user type
          const storedMode = localStorage.getItem(ACTIVE_MODE_KEY) as ActiveMode | null;
          if (storedMode && (storedMode === "host" || storedMode === "guest")) {
            setActiveMode(storedMode);
          } else if (data.userType === "HOST" && data.hostProfile) {
            setActiveMode("host");
          } else {
            setActiveMode("guest");
          }
        }
      })
      .catch(console.error);
  }, [mockUser, session, status, profileFetched]);

  const switchMode = useCallback((mode: ActiveMode) => {
    localStorage.setItem(ACTIVE_MODE_KEY, mode);
    setActiveMode(mode);
    window.location.reload();
  }, []);

  // Determine effective state
  if (mockUser) {
    // Mock user mode — backwards compatible with useMockUser()
    const canSwitchMode = Boolean(
      mockUser.role === "host" &&
      mockUser.hostType === "individual" &&
      mockUser.canSwitchMode
    );

    const effectiveRole: "host" | "guest" =
      canSwitchMode ? activeMode :
      mockUser.role === "host" ? "host" : "guest";

    return {
      user: mockUser,
      activeMode,
      isLoading,
      canSwitchMode,
      switchMode,
      effectiveRole,
      isAuthenticated: true,
      isMockUser: true,
      userId: mockUser.id,
      guestProfile: null,
      hostProfile: null,
    };
  }

  // Real session mode
  const isHost = apiProfile?.userType === "HOST" && !!apiProfile?.hostProfile;
  const canSwitchMode = isHost && !!apiProfile?.guestProfile;
  const effectiveRole: "host" | "guest" =
    canSwitchMode ? activeMode :
    isHost ? "host" : "guest";

  const user = apiProfile || (session?.user ? {
    id: session.user.id as string,
    email: session.user.email || "",
    name: session.user.name || session.user.email || "",
    image: session.user.image,
    userType: (session.user as { userType?: string }).userType || "GUEST",
    guestProfile: null,
    hostProfile: null,
  } : null);

  return {
    user,
    activeMode,
    isLoading: isLoading || status === "loading",
    canSwitchMode,
    switchMode,
    effectiveRole,
    isAuthenticated: !!session?.user,
    isMockUser: false,
    userId: (session?.user as { id?: string })?.id || null,
    guestProfile: apiProfile?.guestProfile || null,
    hostProfile: apiProfile?.hostProfile || null,
  };
}
