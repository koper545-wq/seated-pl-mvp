"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "./message-bubble";
import { HomieMessage } from "@/lib/mock-data";
import { Send, Calendar, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

interface ChatViewProps {
  messages: HomieMessage[];
  currentUserId: string;
  otherUserName: string;
  onSendMessage?: (text: string, type?: HomieMessage["type"]) => void;
}

export function ChatView({
  messages,
  currentUserId,
  otherUserName,
  onSendMessage,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: HomieMessage = {
      id: `hm-new-${Date.now()}`,
      conversationId: "",
      senderId: currentUserId,
      senderName: "Ty",
      text: newMessage,
      type: "text",
      isRead: true,
      createdAt: new Date(),
    };

    setLocalMessages([...localMessages, message]);
    onSendMessage?.(newMessage, "text");
    setNewMessage("");
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: HomieMessage[] }[] = [];
  let currentDate = "";

  localMessages.forEach((msg) => {
    const msgDate = msg.createdAt.toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({
        date: msg.createdAt.toLocaleDateString("pl-PL", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        messages: [msg],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {group.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Calendar className="h-4 w-4 mr-2" />
                Udostępnij wydarzenie
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Zaplanuj razem
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            placeholder={`Wiadomość do ${otherUserName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />

          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-amber-500 hover:bg-amber-600 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
