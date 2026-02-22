"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

// Redirect to main hosts page (verification is now integrated there)
export default function HostVerificationRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push("/admin/hosts");
  }, [router]);
  return (
    <div className="p-8 text-center">
      <p className="text-stone-500">Przekierowanie...</p>
    </div>
  );
}
