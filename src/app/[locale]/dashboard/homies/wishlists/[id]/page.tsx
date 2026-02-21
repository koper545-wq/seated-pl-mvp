"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WishlistDetail } from "@/components/shared-wishlist";
import { ArrowLeft } from "lucide-react";
import { getSharedWishlists } from "@/lib/mock-data";

interface WishlistDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WishlistDetailPage({ params }: WishlistDetailPageProps) {
  const { id } = use(params);
  const wishlists = getSharedWishlists("user-current");
  const wishlist = wishlists.find((w) => w.id === id);

  if (!wishlist) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/dashboard/homies/wishlists" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Wróć do list
        </Link>
      </Button>

      <WishlistDetail wishlist={wishlist} />
    </div>
  );
}
