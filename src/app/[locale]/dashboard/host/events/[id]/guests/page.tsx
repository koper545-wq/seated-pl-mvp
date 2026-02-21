"use client";

import { useState, use } from "react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getHostEventById,
  getBookingsByEventId,
  getWaitlistByEventId,
  removeFromWaitlist,
  addBookingMessage,
  MockBooking,
  WaitlistEntry,
  BookingMessage,
  bookingStatusLabels,
  HostEvent,
} from "@/lib/mock-data";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Check,
  X,
  Mail,
  Phone,
  UtensilsCrossed,
  MessageSquare,
  Download,
  Printer,
  AlertCircle,
  CheckCircle,
  UserCheck,
  UserX,
  Eye,
  Star,
  Bell,
  Trash2,
  Flag,
  Send,
  MessageCircle,
} from "lucide-react";
import { ReportDialog } from "@/components/reports";
import { cn, formatPrice } from "@/lib/utils";

interface EventGuestsPageProps {
  params: Promise<{ id: string }>;
}

export default function EventGuestsPage({ params }: EventGuestsPageProps) {
  const { id } = use(params);
  const event = getHostEventById(id);

  if (!event) {
    notFound();
  }

  const [bookings, setBookings] = useState<MockBooking[]>(
    getBookingsByEventId(id)
  );
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(
    getWaitlistByEventId(id)
  );
  const [actionBooking, setActionBooking] = useState<{
    booking: MockBooking;
    action: "approve" | "decline";
  } | null>(null);
  const [entryToRemove, setEntryToRemove] = useState<WaitlistEntry | null>(null);

  // Reply to inquiry state
  const [replyBooking, setReplyBooking] = useState<MockBooking | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Separate bookings
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "approved");
  const declinedBookings = bookings.filter(
    (b) => b.status === "declined" || b.status === "cancelled"
  );

  // Bookings with inquiries (special requests or messages)
  const bookingsWithInquiries = bookings.filter(
    (b) => b.specialRequests || (b.messages && b.messages.length > 0)
  );

  // Count unanswered inquiries
  const unansweredInquiriesCount = bookingsWithInquiries.filter((b) => {
    if (b.messages && b.messages.length > 0) {
      const lastMessage = b.messages[b.messages.length - 1];
      return lastMessage.senderType === "guest";
    }
    return b.specialRequests && (!b.messages || b.messages.length === 0);
  }).length;

  // Calculate totals
  const totalGuests = confirmedBookings.reduce((sum, b) => sum + b.ticketCount, 0);
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + b.totalPrice - b.platformFee,
    0
  );

  const handleAction = (booking: MockBooking, action: "approve" | "decline") => {
    setActionBooking({ booking, action });
  };

  const confirmAction = () => {
    if (actionBooking) {
      const { booking, action } = actionBooking;
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: action === "approve" ? "approved" : ("declined" as const),
                approvedAt: action === "approve" ? new Date() : undefined,
              }
            : b
        )
      );
      setActionBooking(null);
    }
  };

  const handleApproveAll = () => {
    setBookings((prev) =>
      prev.map((b) =>
        b.status === "pending"
          ? { ...b, status: "approved" as const, approvedAt: new Date() }
          : b
      )
    );
  };

  const handleRemoveFromWaitlist = (entry: WaitlistEntry) => {
    setEntryToRemove(entry);
  };

  const confirmRemoveFromWaitlist = () => {
    if (entryToRemove) {
      removeFromWaitlist(entryToRemove.id);
      setWaitlistEntries((prev) => prev.filter((e) => e.id !== entryToRemove.id));
      setEntryToRemove(null);
    }
  };

  // Handle reply to inquiry
  const handleReply = (booking: MockBooking) => {
    setReplyBooking(booking);
    setReplyMessage("");
  };

  const sendReply = () => {
    if (!replyBooking || !replyMessage.trim()) return;

    setIsSendingReply(true);

    // Simulate sending (in real app would call API)
    // Get host info from a confirmed booking's event data, or use defaults
    const hostInfo = bookings.find(b => b.event?.hostId)?.event || { hostId: "host-1", hostName: "Host" };

    setTimeout(() => {
      const newMessage = addBookingMessage(
        replyBooking.id,
        "host",
        hostInfo.hostId,
        hostInfo.hostName,
        replyMessage.trim()
      );

      if (newMessage) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === replyBooking.id
              ? {
                  ...b,
                  messages: [...(b.messages || []), newMessage],
                }
              : b
          )
        );
      }

      setIsSendingReply(false);
      setReplyBooking(null);
      setReplyMessage("");
    }, 500);
  };

  // Collect dietary info from confirmed bookings
  const dietaryInfo = confirmedBookings
    .filter((b) => b.dietaryInfo)
    .map((b) => ({ name: b.guestName, info: b.dietaryInfo!, tickets: b.ticketCount }));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard/host"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do panelu
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {event.dateFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {totalGuests}/{event.capacity} gości
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-1" />
                Drukuj listę
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Eksportuj
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Podgląd
                </Link>
              </Button>
              {/* Feedback button - show after event */}
              {event.date < new Date() && confirmedBookings.length > 0 && (
                <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
                  <Link href={`/dashboard/host/events/${event.id}/feedback`}>
                    <Star className="h-4 w-4 mr-1" />
                    Oceń gości
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {pendingBookings.length}
              </p>
              <p className="text-xs text-muted-foreground">Oczekujące</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{totalGuests}</p>
              <p className="text-xs text-muted-foreground">Potwierdzonych</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{event.spotsLeft}</p>
              <p className="text-xs text-muted-foreground">Wolnych miejsc</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {formatPrice(totalRevenue * 100)}
              </p>
              <p className="text-xs text-muted-foreground">Przychód</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending alert with approve all */}
        {pendingBookings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">
                  {pendingBookings.length} rezerwacj
                  {pendingBookings.length === 1 ? "a" : pendingBookings.length < 5 ? "e" : "i"}{" "}
                  czeka na Twoją decyzję
                </p>
                <p className="text-sm text-yellow-700">
                  Łącznie {pendingBookings.reduce((s, b) => s + b.ticketCount, 0)} osób
                </p>
              </div>
            </div>
            <Button
              onClick={handleApproveAll}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Akceptuj wszystkie
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - bookings list */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Oczekujące
                  {pendingBookings.length > 0 && (
                    <Badge className="bg-yellow-500">{pendingBookings.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Potwierdzone
                  <Badge variant="secondary">{confirmedBookings.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="declined" className="flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Odrzucone
                </TabsTrigger>
                <TabsTrigger value="inquiries" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Zapytania
                  {unansweredInquiriesCount > 0 && (
                    <Badge className="bg-blue-500">{unansweredInquiriesCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="waitlist" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Lista oczekujących
                  {waitlistEntries.filter(e => e.status === "waiting").length > 0 && (
                    <Badge variant="secondary">
                      {waitlistEntries.filter(e => e.status === "waiting").length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Pending */}
              <TabsContent value="pending" className="space-y-3">
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((booking) => (
                    <GuestCard
                      key={booking.id}
                      booking={booking}
                      event={event}
                      onApprove={() => handleAction(booking, "approve")}
                      onDecline={() => handleAction(booking, "decline")}
                      showActions
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={CheckCircle}
                    title="Brak oczekujących"
                    description="Wszystkie rezerwacje zostały rozpatrzone."
                    compact
                  />
                )}
              </TabsContent>

              {/* Confirmed */}
              <TabsContent value="confirmed" className="space-y-3">
                {confirmedBookings.length > 0 ? (
                  confirmedBookings.map((booking) => (
                    <GuestCard key={booking.id} booking={booking} event={event} />
                  ))
                ) : (
                  <EmptyState
                    icon={Users}
                    title="Brak potwierdzonych gości"
                    description="Zaakceptuj rezerwacje, aby zobaczyć listę gości."
                    compact
                  />
                )}
              </TabsContent>

              {/* Declined */}
              <TabsContent value="declined" className="space-y-3">
                {declinedBookings.length > 0 ? (
                  declinedBookings.map((booking) => (
                    <GuestCard key={booking.id} booking={booking} event={event} />
                  ))
                ) : (
                  <EmptyState
                    icon={UserX}
                    title="Brak odrzuconych"
                    description="Nie odrzuciłeś jeszcze żadnych rezerwacji."
                    compact
                  />
                )}
              </TabsContent>

              {/* Inquiries */}
              <TabsContent value="inquiries" className="space-y-3">
                {bookingsWithInquiries.length > 0 ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
                      <p>
                        Tutaj znajdziesz wszystkie zapytania od gości. Odpowiadaj szybko, aby zapewnić
                        gościom dobrą obsługę.
                      </p>
                    </div>
                    {bookingsWithInquiries.map((booking) => (
                      <InquiryCard
                        key={booking.id}
                        booking={booking}
                        event={event}
                        onReply={() => handleReply(booking)}
                      />
                    ))}
                  </>
                ) : (
                  <EmptyState
                    icon={MessageCircle}
                    title="Brak zapytań"
                    description="Goście nie zadali jeszcze żadnych pytań dotyczących tego wydarzenia."
                    compact
                  />
                )}
              </TabsContent>

              {/* Waitlist */}
              <TabsContent value="waitlist" className="space-y-3">
                {waitlistEntries.length > 0 ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
                      <p>
                        Osoby na liście oczekujących zostaną automatycznie powiadomione emailem,
                        gdy zwolni się miejsce. Będą mieć 12 godzin na dokonanie rezerwacji.
                      </p>
                    </div>
                    {waitlistEntries
                      .sort((a, b) => a.position - b.position)
                      .map((entry) => (
                        <WaitlistEntryCard
                          key={entry.id}
                          entry={entry}
                          onRemove={() => handleRemoveFromWaitlist(entry)}
                        />
                      ))}
                  </>
                ) : (
                  <EmptyState
                    icon={Bell}
                    title="Brak osób na liście oczekujących"
                    description="Gdy wydarzenie będzie wyprzedane, goście będą mogli zapisać się na listę."
                    compact
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - dietary info */}
          <div className="space-y-6">
            {/* Dietary summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                  Wymagania dietetyczne
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dietaryInfo.length > 0 ? (
                  <div className="space-y-3">
                    {dietaryInfo.map((item, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">{item.info}</p>
                        {item.tickets > 1 && (
                          <p className="text-xs text-muted-foreground">
                            ({item.tickets} osoby)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak specjalnych wymagań dietetycznych.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Special requests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                  Specjalne życzenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {confirmedBookings.filter((b) => b.specialRequests).length > 0 ? (
                  <div className="space-y-3">
                    {confirmedBookings
                      .filter((b) => b.specialRequests)
                      .map((booking) => (
                        <div key={booking.id} className="text-sm">
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-muted-foreground">
                            {booking.specialRequests}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak specjalnych życzeń od gości.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Podsumowanie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pojemność:</span>
                  <span>{event.capacity} osób</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potwierdzonych:</span>
                  <span className="text-green-600 font-medium">{totalGuests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wolnych miejsc:</span>
                  <span>{event.spotsLeft}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cena/os:</span>
                  <span>{event.price} PLN</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Przychód netto:</span>
                  <span className="text-amber-600">{formatPrice(totalRevenue * 100)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action confirmation dialog */}
      <AlertDialog
        open={actionBooking !== null}
        onOpenChange={(open) => !open && setActionBooking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionBooking?.action === "approve"
                ? "Zaakceptować rezerwację?"
                : "Odrzucić rezerwację?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionBooking?.action === "approve" ? (
                <>
                  <strong>{actionBooking?.booking.guestName}</strong> (
                  {actionBooking?.booking.ticketCount}{" "}
                  {actionBooking?.booking.ticketCount === 1 ? "osoba" : "osoby"})
                  otrzyma email z potwierdzeniem i pełnym adresem wydarzenia.
                </>
              ) : (
                <>
                  <strong>{actionBooking?.booking.guestName}</strong> zostanie
                  powiadomiony o odrzuceniu rezerwacji.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionBooking?.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionBooking?.action === "approve" ? "Zaakceptuj" : "Odrzuć"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove from waitlist confirmation */}
      <AlertDialog
        open={entryToRemove !== null}
        onOpenChange={(open) => !open && setEntryToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć z listy oczekujących?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{entryToRemove?.name || entryToRemove?.email}</strong> zostanie
              usunięty z listy oczekujących. Ta osoba nie będzie już powiadamiana
              o wolnych miejscach.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFromWaitlist}
              className="bg-red-600 hover:bg-red-700"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reply to inquiry dialog */}
      <Dialog
        open={replyBooking !== null}
        onOpenChange={(open) => !open && setReplyBooking(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-amber-600" />
              Odpowiedz na zapytanie
            </DialogTitle>
          </DialogHeader>

          {replyBooking && (
            <div className="space-y-4">
              {/* Guest info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-amber-100 text-amber-700">
                    {replyBooking.guestName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{replyBooking.guestName}</p>
                  <p className="text-sm text-muted-foreground">{replyBooking.guestEmail}</p>
                </div>
              </div>

              {/* Message history */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {/* Original request if no messages */}
                {replyBooking.specialRequests && (!replyBooking.messages || replyBooking.messages.length === 0) && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {replyBooking.guestName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm">{replyBooking.specialRequests}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {replyBooking.createdAt.toLocaleString("pl-PL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {replyBooking.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.senderType === "host" && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          msg.senderType === "host"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {msg.senderName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex-1", msg.senderType === "host" && "text-right")}>
                      <div
                        className={cn(
                          "rounded-lg p-3 inline-block text-left",
                          msg.senderType === "host"
                            ? "bg-amber-50"
                            : "bg-blue-50"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {msg.createdAt.toLocaleString("pl-PL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Napisz odpowiedź..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyBooking(null)}
              disabled={isSendingReply}
            >
              Anuluj
            </Button>
            <Button
              onClick={sendReply}
              disabled={!replyMessage.trim() || isSendingReply}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSendingReply ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Wyślij
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Guest card component
interface GuestCardProps {
  booking: MockBooking;
  event: HostEvent;
  onApprove?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

function GuestCard({
  booking,
  event,
  onApprove,
  onDecline,
  showActions = false,
}: GuestCardProps) {
  const statusInfo = bookingStatusLabels[booking.status];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-amber-100 text-amber-700">
              {booking.guestName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{booking.guestName}</h4>
              <Badge className={cn(statusInfo.color, "text-xs")} variant="secondary">
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {booking.ticketCount} {booking.ticketCount === 1 ? "os." : "os."}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mb-2">
              <a
                href={`mailto:${booking.guestEmail}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Mail className="h-3 w-3" />
                {booking.guestEmail}
              </a>
              {booking.guestPhone && (
                <a
                  href={`tel:${booking.guestPhone}`}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Phone className="h-3 w-3" />
                  {booking.guestPhone}
                </a>
              )}
            </div>

            {(booking.dietaryInfo || booking.specialRequests) && (
              <div className="text-sm space-y-1">
                {booking.dietaryInfo && (
                  <p className="flex items-start gap-1">
                    <UtensilsCrossed className="h-3 w-3 mt-1 text-amber-600" />
                    <span className="text-muted-foreground">{booking.dietaryInfo}</span>
                  </p>
                )}
                {booking.specialRequests && (
                  <p className="flex items-start gap-1">
                    <MessageSquare className="h-3 w-3 mt-1 text-blue-600" />
                    <span className="text-muted-foreground">{booking.specialRequests}</span>
                  </p>
                )}
              </div>
            )}

            <p className="text-sm font-medium text-amber-600 mt-2">
              {formatPrice((booking.totalPrice - booking.platformFee) * 100)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {showActions && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onApprove}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={onDecline}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <ReportDialog
              reportType="guest"
              reportedEntityId={booking.guestId || booking.id}
              reportedEntityName={booking.guestName}
              eventId={event.id}
              eventTitle={event.title}
              bookingId={booking.id}
              reporterRole="host"
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-600"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Inquiry card component
interface InquiryCardProps {
  booking: MockBooking;
  event: HostEvent;
  onReply: () => void;
}

function InquiryCard({ booking, event, onReply }: InquiryCardProps) {
  const statusInfo = bookingStatusLabels[booking.status];

  // Check if there's an unanswered inquiry
  const hasUnansweredInquiry = (() => {
    if (booking.messages && booking.messages.length > 0) {
      const lastMessage = booking.messages[booking.messages.length - 1];
      return lastMessage.senderType === "guest";
    }
    return booking.specialRequests && (!booking.messages || booking.messages.length === 0);
  })();

  // Get the last message or special request
  const lastInquiry = (() => {
    if (booking.messages && booking.messages.length > 0) {
      return {
        message: booking.messages[booking.messages.length - 1].message,
        date: booking.messages[booking.messages.length - 1].createdAt,
        isFromGuest: booking.messages[booking.messages.length - 1].senderType === "guest",
      };
    }
    if (booking.specialRequests) {
      return {
        message: booking.specialRequests,
        date: booking.createdAt,
        isFromGuest: true,
      };
    }
    return null;
  })();

  const messageCount = booking.messages?.length || 0;

  return (
    <Card className={cn(hasUnansweredInquiry && "border-blue-200 bg-blue-50/30")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-amber-100 text-amber-700">
              {booking.guestName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{booking.guestName}</h4>
              <Badge className={cn(statusInfo.color, "text-xs")} variant="secondary">
                {statusInfo.label}
              </Badge>
              {hasUnansweredInquiry && (
                <Badge className="bg-blue-500 text-white text-xs">
                  Oczekuje na odpowiedź
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3">
              <a
                href={`mailto:${booking.guestEmail}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Mail className="h-3 w-3" />
                {booking.guestEmail}
              </a>
              {messageCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {messageCount} {messageCount === 1 ? "wiadomość" : messageCount < 5 ? "wiadomości" : "wiadomości"}
                </span>
              )}
            </div>

            {/* Last message preview */}
            {lastInquiry && (
              <div className={cn(
                "rounded-lg p-3 text-sm",
                lastInquiry.isFromGuest ? "bg-blue-50 border border-blue-100" : "bg-amber-50 border border-amber-100"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-xs font-medium",
                    lastInquiry.isFromGuest ? "text-blue-700" : "text-amber-700"
                  )}>
                    {lastInquiry.isFromGuest ? booking.guestName : "Ty"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lastInquiry.date.toLocaleString("pl-PL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-2">{lastInquiry.message}</p>
              </div>
            )}
          </div>

          {/* Reply button */}
          <Button
            onClick={onReply}
            size="sm"
            className={cn(
              hasUnansweredInquiry
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-amber-600 hover:bg-amber-700"
            )}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {hasUnansweredInquiry ? "Odpowiedz" : "Wiadomość"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Waitlist entry card component
interface WaitlistEntryCardProps {
  entry: WaitlistEntry;
  onRemove: () => void;
}

const waitlistStatusLabels: Record<WaitlistEntry["status"], { label: string; color: string }> = {
  waiting: { label: "Oczekuje", color: "bg-blue-100 text-blue-700" },
  notified: { label: "Powiadomiony", color: "bg-amber-100 text-amber-700" },
  expired: { label: "Wygasło", color: "bg-gray-100 text-gray-700" },
  converted: { label: "Zarezerwował", color: "bg-green-100 text-green-700" },
};

function WaitlistEntryCard({ entry, onRemove }: WaitlistEntryCardProps) {
  const statusInfo = waitlistStatusLabels[entry.status];
  const displayName = entry.name || entry.email.split("@")[0];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Position number */}
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
            #{entry.position}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{displayName}</h4>
              <Badge className={cn(statusInfo.color, "text-xs")} variant="secondary">
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entry.ticketsWanted}{" "}
                {entry.ticketsWanted === 1 ? "miejsce" : entry.ticketsWanted < 5 ? "miejsca" : "miejsc"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mb-2">
              <a
                href={`mailto:${entry.email}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Mail className="h-3 w-3" />
                {entry.email}
              </a>
              {entry.phone && (
                <a
                  href={`tel:${entry.phone}`}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Phone className="h-3 w-3" />
                  {entry.phone}
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Zapisano: {entry.createdAt.toLocaleDateString("pl-PL")}
              </span>
              {entry.notifiedAt && (
                <span className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  Powiadomiono: {entry.notifiedAt.toLocaleDateString("pl-PL")}
                </span>
              )}
              {entry.expiresAt && entry.status === "notified" && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" />
                  Wygasa: {entry.expiresAt.toLocaleString("pl-PL", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Remove button - only for waiting/notified statuses */}
          {(entry.status === "waiting" || entry.status === "notified") && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
