"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomieMessage } from "@/lib/mock-data";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface MessageBubbleProps {
  message: HomieMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = false }: MessageBubbleProps) {
  const renderContent = () => {
    if (message.type === "event_share" && message.eventId) {
      return (
        <div>
          <p className="text-xs text-stone-500 mb-2">Udostępniono wydarzenie:</p>
          <Link href={`/events/${message.eventId}`}>
            <Card className="bg-white/50 hover:bg-white transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm line-clamp-1">
                      {message.eventTitle}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Zobacz wydarzenie
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      );
    }

    if (message.type === "planning_invite" && message.planningSessionId) {
      return (
        <div>
          <p className="text-xs text-stone-500 mb-2">Zaproszenie do planowania:</p>
          <Link href={`/dashboard/homies/planning/${message.planningSessionId}`}>
            <Card className="bg-white/50 hover:bg-white transition-colors">
              <CardContent className="p-3 text-center">
                <span className="text-2xl mb-2 block">📅</span>
                <p className="font-medium text-stone-900 text-sm">
                  Zaplanujmy wydarzenie razem!
                </p>
                <Badge className="mt-2 bg-amber-500">Dołącz</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      );
    }

    return <p className="text-sm">{message.text}</p>;
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-amber-500 text-white rounded-br-sm"
            : "bg-stone-100 text-stone-900 rounded-bl-sm"
        }`}
      >
        {renderContent()}
        <p
          className={`text-xs mt-1 ${
            isOwn ? "text-amber-100" : "text-stone-500"
          }`}
        >
          {format(message.createdAt, "HH:mm", { locale: pl })}
        </p>
      </div>
    </div>
  );
}
