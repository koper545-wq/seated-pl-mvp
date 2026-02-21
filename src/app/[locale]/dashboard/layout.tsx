"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const MOCK_USER_KEY = "seated-mock-user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [hasMockUser, setHasMockUser] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check for mock user in localStorage (dev mode)
    const stored = localStorage.getItem(MOCK_USER_KEY);
    if (stored) {
      setHasMockUser(true);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    // If no mock user and session is not authenticated, redirect to login
    if (!hasMockUser && status === "unauthenticated") {
      router.push("/login");
    }
  }, [checked, hasMockUser, status, router]);

  // Show loading while checking
  if (!checked || (!hasMockUser && status === "loading")) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Sprawdzanie dostępu...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and no mock user, show nothing (redirect happening)
  if (!hasMockUser && status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
