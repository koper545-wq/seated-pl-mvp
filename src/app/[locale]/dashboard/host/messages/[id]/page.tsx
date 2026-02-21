"use client";

import { useState, useRef, useEffect, use } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Calendar, MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getConversationById,
  getMessagesByConversationId,
  type MockMessage,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useMockUser } from "@/components/dev/account-switcher";

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Dzisiaj";
  } else if (days === 1) {
    return "Wczoraj";
  } else {
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
}

interface MessageBubbleProps {
  message: MockMessage;
  isOwn: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  return (
    <div
      className={cn("flex gap-2 mb-2", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {!isOwn && showAvatar ? (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="bg-stone-100 text-stone-700 text-xs">
            {message.senderName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      ) : !isOwn ? (
        <div className="w-8" />
      ) : null}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-amber-600 text-white rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-amber-100" : "text-muted-foreground"
          )}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function HostConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("messages");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user: mockUser, isLoading } = useMockUser();

  const conversation = getConversationById(id);
  const currentUserId = mockUser?.id || "host-1";
  const currentUserName = mockUser?.name || "Anna Kowalska";

  useEffect(() => {
    const conversationMessages = getMessagesByConversationId(id);
    setMessages(conversationMessages);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg: MockMessage = {
      id: `msg-new-${Date.now()}`,
      conversationId: id,
      senderId: currentUserId,
      senderName: currentUserName,
      text: newMessage.trim(),
      isRead: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    inputRef.current?.focus();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-stone-500">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Konwersacja nie znaleziona
          </h2>
          <Link href="/dashboard/host/messages">
            <Button variant="outline">{t("backToMessages")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: MockMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = msg.createdAt.toDateString();
    const existing = groupedMessages.find((g) => g.date === dateStr);
    if (existing) {
      existing.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/host/messages">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.guestAvatar} />
              <AvatarFallback className="bg-stone-100 text-stone-700">
                {conversation.guestName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">
                {conversation.guestName}
              </h1>
              {conversation.eventTitle && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="truncate">{conversation.eventTitle}</span>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t("markAsRead")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          {groupedMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>{t("emptyChat")}</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {formatDateSeparator(new Date(group.date))}
                  </span>
                </div>

                {/* Messages */}
                {group.messages.map((msg, msgIndex) => {
                  const isOwn = msg.senderId === currentUserId;
                  const prevMsg = group.messages[msgIndex - 1];
                  const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t">
        <form onSubmit={handleSendMessage} className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder={t("typeMessage")}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
