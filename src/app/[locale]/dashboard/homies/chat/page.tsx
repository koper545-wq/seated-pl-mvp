"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/homie-chat";
import {
  getHomieConversations,
  getMutualHomies,
  adminUsers,
  mockEvents,
} from "@/lib/mock-data";
import { ArrowLeft, Search, MessageSquarePlus, Users } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HomiesChatListPage() {
  const currentUserId = "user-current";
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = getHomieConversations(currentUserId);
  const mutualHomies = getMutualHomies(currentUserId);

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const otherIndex = c.participants.findIndex((p) => p !== currentUserId);
    const otherName = c.participantNames[otherIndex] || "";
    return otherName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get mutual homies who don't have a conversation yet
  const homiesWithoutConversation = mutualHomies.filter((homieId) => {
    return !conversations.some((c) => c.participants.includes(homieId));
  });

  // Get name for a user ID
  const getPersonName = (id: string): string => {
    const hostEvent = mockEvents.find((e) => e.host.id === id);
    if (hostEvent) return hostEvent.host.name;
    const user = adminUsers.find((u) => u.id === id);
    if (user) return `${user.firstName} ${user.lastName}`;
    return "Użytkownik";
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/homies">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Wiadomości</h1>
              <p className="text-sm text-stone-500">
                {conversations.length} rozmów
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Szukaj rozmów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Start new conversation */}
        {homiesWithoutConversation.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4 text-amber-500" />
                Rozpocznij rozmowę
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {homiesWithoutConversation.slice(0, 5).map((homieId) => {
                  const name = getPersonName(homieId);
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("");
                  return (
                    <Link
                      key={homieId}
                      href={`/dashboard/homies/chat/${homieId}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-amber-50"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversations */}
        <ConversationList
          conversations={filteredConversations}
          currentUserId={currentUserId}
          emptyMessage="Nie masz jeszcze żadnych rozmów"
        />

        {conversations.length === 0 && (
          <div className="text-center mt-8">
            <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-semibold text-stone-900 mb-2">
              Zacznij rozmawiać!
            </h3>
            <p className="text-stone-500 mb-4">
              Znajdź swoich homies i rozpocznij rozmowę.
            </p>
            <Link href="/dashboard/homies">
              <Button>Znajdź znajomych</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
