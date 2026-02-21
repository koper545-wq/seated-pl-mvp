"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  getConversationsByUserId,
  type MockConversation,
} from "@/lib/mock-data";

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (days === 1) {
    return "Wczoraj";
  } else if (days < 7) {
    return date.toLocaleDateString("pl-PL", { weekday: "short" });
  } else {
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
    });
  }
}

function ConversationItem({
  conversation,
}: {
  conversation: MockConversation;
}) {
  return (
    <Link
      href={`/dashboard/messages/${conversation.id}`}
      className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.hostAvatar} />
        <AvatarFallback className="bg-amber-100 text-amber-700">
          {conversation.hostName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium truncate">{conversation.hostName}</span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>

        {conversation.eventTitle && (
          <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
            <Calendar className="h-3 w-3" />
            <span className="truncate">{conversation.eventTitle}</span>
          </div>
        )}

        {conversation.lastMessage && (
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {conversation.unreadCount > 0 && (
          <Badge className="bg-amber-600 text-white rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
            {conversation.unreadCount}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function MessagesPage() {
  const t = useTranslations("messages");
  const [searchQuery, setSearchQuery] = useState("");

  // Get conversations for current user (guest)
  const conversations = getConversationsByUserId("user-current", "guest");

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="container max-w-2xl mx-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {t("noConversations")}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {t("noConversationsDesc")}
            </p>
            <Link href="/events" className="mt-4">
              <Button className="bg-amber-600 hover:bg-amber-700">
                {t("startConversation")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
