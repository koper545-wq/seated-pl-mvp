"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SocialPostCard } from "@/components/social-feed";
import {
  getSocialFeed,
  FeedType,
} from "@/lib/mock-data";
import {
  Users,
  MapPin,
  Globe,
  Plus,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function SocialFeedPage() {
  const currentUserId = "user-current";
  const [activeTab, setActiveTab] = useState<FeedType>("friends");

  const friendsPosts = getSocialFeed(currentUserId, "friends", 20);
  const nearbyPosts = getSocialFeed(currentUserId, "nearby", 20);
  const globalPosts = getSocialFeed(currentUserId, "global", 20);

  const getEmptyMessage = (type: FeedType) => {
    switch (type) {
      case "friends":
        return {
          icon: <Users className="h-12 w-12 text-stone-300" />,
          title: "Brak aktywności znajomych",
          description: "Zaobserwuj więcej osób, aby zobaczyć ich aktywność tutaj.",
          action: { label: "Znajdź znajomych", href: "/dashboard/homies" },
        };
      case "nearby":
        return {
          icon: <MapPin className="h-12 w-12 text-stone-300" />,
          title: "Brak aktywności w pobliżu",
          description: "Nie ma jeszcze żadnych postów z Twojej okolicy.",
          action: { label: "Przeglądaj wydarzenia", href: "/events" },
        };
      case "global":
        return {
          icon: <Globe className="h-12 w-12 text-stone-300" />,
          title: "Brak aktywności",
          description: "Wkrótce pojawią się tutaj popularne posty.",
          action: { label: "Przeglądaj wydarzenia", href: "/events" },
        };
    }
  };

  const renderFeed = (posts: typeof friendsPosts, type: FeedType) => {
    if (posts.length === 0) {
      const empty = getEmptyMessage(type);
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">{empty.icon}</div>
            <h3 className="font-semibold text-stone-900 mb-2">{empty.title}</h3>
            <p className="text-stone-500 mb-4">{empty.description}</p>
            <Link href={empty.action.href}>
              <Button variant="outline">{empty.action.label}</Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <SocialPostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Społeczność
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FeedType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Znajomi
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              W pobliżu
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Popularne
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-0">
            {renderFeed(friendsPosts, "friends")}
          </TabsContent>

          <TabsContent value="nearby" className="mt-0">
            {renderFeed(nearbyPosts, "nearby")}
          </TabsContent>

          <TabsContent value="global" className="mt-0">
            {renderFeed(globalPosts, "global")}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating action button */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8">
        <Link href="/events">
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-amber-500 hover:bg-amber-600 h-14 w-14"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
