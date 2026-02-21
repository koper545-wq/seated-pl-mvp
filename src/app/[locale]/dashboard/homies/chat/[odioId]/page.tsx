"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatView } from "@/components/homie-chat";
import {
  getConversationWithUser,
  getHomieMessagesByConversation,
  adminUsers,
  mockEvents,
  HomieMessage,
} from "@/lib/mock-data";
import { ArrowLeft, MoreVertical, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomieChatPage({
  params,
}: {
  params: Promise<{ odioId: string }>;
}) {
  const { odioId } = use(params);
  const currentUserId = "user-current";

  // Get person name
  const getPersonName = (id: string): string => {
    const hostEvent = mockEvents.find((e) => e.host.id === id);
    if (hostEvent) return hostEvent.host.name;
    const user = adminUsers.find((u) => u.id === id);
    if (user) return `${user.firstName} ${user.lastName}`;
    return "Użytkownik";
  };

  const otherUserName = getPersonName(odioId);
  const initials = otherUserName
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Get conversation and messages
  const conversation = getConversationWithUser(currentUserId, odioId);
  const messages = conversation
    ? getHomieMessagesByConversation(conversation.id)
    : [];

  // If no conversation exists, show empty chat
  const displayMessages: HomieMessage[] = messages.length > 0 ? messages : [];

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/homies/chat">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-100 text-amber-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-stone-900">{otherUserName}</h1>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${odioId}`}>
                    <User className="h-4 w-4 mr-2" />
                    Zobacz profil
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden max-w-2xl w-full mx-auto">
        <ChatView
          messages={displayMessages}
          currentUserId={currentUserId}
          otherUserName={otherUserName}
        />
      </div>
    </div>
  );
}
