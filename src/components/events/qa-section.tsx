"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EventQuestion } from "@/lib/mock-data";
import { MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface QASectionProps {
  questions: EventQuestion[];
  eventId: string;
  hostName: string;
}

export function QASection({ questions, eventId, hostName }: QASectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const displayedQuestions = showAll ? questions : questions.slice(0, 3);
  const hasMoreQuestions = questions.length > 3;

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setNewQuestion("");

    // Reset submitted state after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-amber-600" />
          Pytania i odpowiedzi
        </h2>
        {questions.length > 0 && (
          <Badge variant="secondary">{questions.length} pytań</Badge>
        )}
      </div>

      {/* Questions list */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {displayedQuestions.map((q) => (
            <Card key={q.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Question */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-stone-100 text-stone-600 text-xs">
                        {q.authorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{q.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(q.createdAt, {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{q.question}</p>
                    </div>
                  </div>

                  {/* Answer */}
                  {q.answer && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex gap-3 pl-4 border-l-2 border-amber-200">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                            {hostName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{hostName}</span>
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-5 border-amber-300 text-amber-700"
                            >
                              Host
                            </Badge>
                            {q.answeredAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(q.answeredAt, {
                                  addSuffix: true,
                                  locale: pl,
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{q.answer}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Show more/less button */}
          {hasMoreQuestions && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Pokaż mniej
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Pokaż wszystkie ({questions.length})
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Brak pytań. Bądź pierwszy i zadaj pytanie hostowi!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ask a question */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Zadaj pytanie</h3>
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 py-4">
              <CheckCircle className="h-5 w-5" />
              <span>Pytanie zostało wysłane! Host odpowie wkrótce.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder={`Masz pytanie do ${hostName}? Np. czy można dostosować menu do diety?`}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Pytania i odpowiedzi są widoczne dla wszystkich
                </p>
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={!newQuestion.trim() || isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    "Wysyłanie..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Wyślij pytanie
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
