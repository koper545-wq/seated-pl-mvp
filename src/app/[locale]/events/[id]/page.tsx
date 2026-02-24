import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EventCard, QASection, HostCardWithFollow, EventActionButtons } from "@/components/events";
import { BadgeDisplay } from "@/components/badges";
import { ReviewsSection } from "@/components/reviews";
import { WaitlistDialog } from "@/components/waitlist";
import { WhosGoingSection } from "@/components/whos-going";
import { getQuestionsByEventId } from "@/lib/mock-data";
import { getEventDetail, getPublishedEvents } from "@/lib/dal/events";
import { db } from "@/lib/db";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  CheckCircle,
  ChefHat,
  Utensils,
  ArrowLeft,
} from "lucide-react";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventDetail(id);

  if (!event) {
    notFound();
  }

  const isSoldOut = event.spotsLeft === 0;

  // Get similar events (same type, excluding current)
  const allEvents = await getPublishedEvents({ type: event.typeSlug, limit: 4 });
  const similarEvents = allEvents
    .filter((e) => e.id !== event.id)
    .slice(0, 3);

  // Get reviews for this host from database
  const dbReviews = await db.review.findMany({
    where: {
      event: { hostId: event.host.id },
      isHostReview: false,
    },
    include: {
      event: { select: { title: true } },
      author: {
        select: {
          id: true,
          guestProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const hostReviews = dbReviews.map((r) => ({
    id: r.id,
    eventId: r.eventId,
    eventTitle: r.event.title,
    authorId: r.authorId,
    authorName: [r.author.guestProfile?.firstName, r.author.guestProfile?.lastName].filter(Boolean).join(" ") || "Gość",
    authorAvatar: r.author.guestProfile?.avatarUrl || undefined,
    hostId: event.host.id,
    overallRating: r.overallRating,
    foodRating: r.foodRating || 0,
    communicationRating: r.communicationRating || 0,
    valueRating: r.valueRating || 0,
    ambianceRating: r.ambianceRating || 0,
    text: r.text || "",
    photos: r.photos || [],
    verifiedAttendee: r.verifiedAttendee,
    helpfulCount: r.helpfulCount,
    response: r.response || undefined,
    respondedAt: r.respondedAt || undefined,
    createdAt: r.createdAt,
  }));

  // Get Q&A for this event
  const eventQuestions = getQuestionsByEventId(event.id);

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image / gradient */}
      <div
        className={`relative h-64 md:h-80 bg-gradient-to-br ${event.imageGradient}`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full flex items-end pb-6">
          <Link
            href="/events"
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="absolute top-4 right-4">
            <EventActionButtons eventId={event.id} eventTitle={event.title} />
          </div>
          <Badge className="bg-white/90 backdrop-blur-sm text-foreground hover:bg-white">
            {event.type}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and basic info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  <span>{event.dateFormatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>{formatDuration(event.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  <span>Max {event.capacity} osób</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">O wydarzeniu</h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Menu */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-amber-600" />
                Menu
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.menuDescription}
              </p>
            </div>

            {/* Dietary options */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Opcje dietetyczne</h2>
              <div className="flex flex-wrap gap-2">
                {event.dietaryOptions.map((option, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* What to bring */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Co zabrać?</h2>
              <p className="text-muted-foreground">{event.whatToBring}</p>
            </div>

            <Separator />

            {/* Who's Going section */}
            <WhosGoingSection eventId={event.id} />

            <Separator />

            {/* Host card with follow button */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-amber-600" />
                Twój host
              </h2>
              <HostCardWithFollow host={event.host} />
            </div>

            <Separator />

            {/* Q&A section */}
            <QASection
              questions={eventQuestions}
              eventId={event.id}
              hostName={event.host.name}
            />

            <Separator />

            {/* Reviews section */}
            <ReviewsSection
              reviews={hostReviews}
              eventId={event.id}
              eventTitle={event.title}
              hostName={event.host.name}
              canReview={true}
            />
          </div>

          {/* Sidebar - booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold">{event.price}</span>
                      <span className="text-muted-foreground ml-1">
                        PLN / osoba
                      </span>
                    </div>
                    {isSoldOut ? (
                      <Badge variant="destructive">Wyprzedane</Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {event.spotsLeft} wolnych miejsc
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{event.dateFormatted}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Czas trwania: {formatDuration(event.duration)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {isSoldOut ? (
                    <Button className="w-full" variant="outline" disabled>
                      Brak miejsc
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      size="lg"
                      asChild
                    >
                      <Link href={`/events/${event.id}/book`}>
                        Zarezerwuj miejsce
                      </Link>
                    </Button>
                  )}

                  {!isSoldOut && (
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Jeszcze nie zostaniesz obciążony
                    </p>
                  )}

                  {isSoldOut && (
                    <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Chcesz się dowiedzieć, gdy zwolni się miejsce?
                      </p>
                      <WaitlistDialog
                        eventId={event.id}
                        eventTitle={event.title}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick info */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-sm">Zawiera:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Wszystkie składniki i napoje
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Przepisy do domu
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Nowe znajomości
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar events */}
        {similarEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Podobne wydarzenia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  type={event.type}
                  date={event.dateFormatted}
                  location={event.location}
                  price={event.price}
                  spotsLeft={event.spotsLeft}
                  imageGradient={event.imageGradient}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic page — events come from database
export const dynamic = "force-dynamic";
