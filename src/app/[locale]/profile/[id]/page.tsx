import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { db } from "@/lib/db";
import {
  currentGuestProfile,
  getGuestBadges,
  getGuestLevel,
  getXPProgress,
  guestLevels,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // In real app, fetch profile by ID
  // For demo, use current profile
  const profile = currentGuestProfile;
  const badges = getGuestBadges(profile.badges);
  const levelInfo = getGuestLevel(profile.xp);
  const xpProgress = getXPProgress(profile.xp, guestLevels);

  // Fetch real reviews written by this user from database
  const reviews = await db.review.findMany({
    where: { authorId: id, isHostReview: false },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          host: { select: { businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if profile is public
  if (!profile.isPublic) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center p-8">
          <span className="text-6xl mb-4 block">🔒</span>
          <h1 className="text-xl font-bold text-stone-900 mb-2">
            Profil prywatny
          </h1>
          <p className="text-stone-600 mb-6">
            Ten użytkownik ma ustawiony profil jako prywatny.
          </p>
          <Link href="/events">
            <Button>Przeglądaj wydarzenia</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/events">
              <Button variant="ghost" size="sm">
                ← Wróć
              </Button>
            </Link>
            <h1 className="font-semibold text-stone-900">Profil gościa</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-8">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-24" />
          <CardContent className="pt-0 -mt-12">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl mb-3">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>
              <h1 className="text-2xl font-bold text-stone-900">
                {profile.firstName} {profile.lastName.charAt(0)}.
              </h1>
              <p className="text-stone-500">
                📍 {profile.city} · Członek od{" "}
                {format(profile.memberSince, "MMMM yyyy", { locale: pl })}
              </p>

              {/* Social Links */}
              {profile.socialLinks && (
                <div className="flex gap-3 mt-3">
                  {profile.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-500 hover:text-pink-500 transition-colors"
                    >
                      <span className="text-xl">📸</span>
                      <span className="text-sm ml-1">
                        @{profile.socialLinks.instagram}
                      </span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-stone-600 text-center mb-6 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Level Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🏅</span>
                  <div>
                    <p className="font-bold text-stone-900">
                      Poziom {levelInfo.level}
                    </p>
                    <p className="text-sm text-stone-600">{levelInfo.namePl}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">
                    {profile.xp}
                  </p>
                  <p className="text-xs text-stone-500">punktów XP</p>
                </div>
              </div>
              <Progress value={xpProgress.percent} className="h-2" />
              <p className="text-xs text-stone-500 text-center mt-2">
                {xpProgress.percent}% do następnego poziomu
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-stone-50 rounded-xl">
                <p className="text-3xl font-bold text-stone-900">
                  {profile.eventsAttended}
                </p>
                <p className="text-sm text-stone-500">Wydarzeń</p>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-xl">
                <p className="text-3xl font-bold text-stone-900">
                  {profile.reviewsWritten}
                </p>
                <p className="text-sm text-stone-500">Opinii</p>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-xl">
                <p className="text-3xl font-bold text-stone-900">
                  {badges.length}
                </p>
                <p className="text-sm text-stone-500">Odznak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        {badges.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <span>🏆</span> Zdobyte odznaki
              </h2>
              <TooltipProvider>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex items-center gap-2 p-3 rounded-xl ${badge.color} cursor-help`}
                        >
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{badge.namePl}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{badge.descriptionPl}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        )}

        {/* Tabs: Events & Reviews */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="events" className="flex-1">
              Wydarzenia ({profile.attendedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Opinie ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-3">
              {profile.attendedEvents.length === 0 ? (
                <Card className="p-8 text-center">
                  <span className="text-4xl mb-2 block">🍽️</span>
                  <p className="text-stone-500">Brak odbytych wydarzeń</p>
                </Card>
              ) : (
                profile.attendedEvents.map((event) => (
                  <Link href={`/events/${event.eventId}`} key={event.eventId}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex">
                        <div
                          className={`w-24 h-24 bg-gradient-to-br ${event.imageGradient} flex items-center justify-center text-3xl shrink-0`}
                        >
                          🍴
                        </div>
                        <div className="flex-1 p-4">
                          <p className="font-medium text-stone-900 line-clamp-1">
                            {event.eventTitle}
                          </p>
                          <p className="text-sm text-stone-500 mt-1">
                            u {event.hostName}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                              {event.eventType}
                            </span>
                            <span className="text-xs text-stone-400">
                              {format(event.eventDate, "d MMM yyyy", {
                                locale: pl,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center">
                  <span className="text-4xl mb-2 block">⭐</span>
                  <p className="text-stone-500">Brak napisanych opinii</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-stone-900">
                          {review.event.title}
                        </p>
                        <p className="text-sm text-stone-500">
                          u {review.event.host.businessName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                        <span className="text-amber-500">★</span>
                        <span className="font-medium text-amber-700">
                          {review.overallRating}
                        </span>
                      </div>
                    </div>
                    {review.text && (
                      <p className="text-stone-600">{review.text}</p>
                    )}
                    <p className="text-xs text-stone-400 mt-2">
                      {format(review.createdAt, "d MMMM yyyy", { locale: pl })}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Photos Gallery */}
        {profile.photos.length > 0 && (
          <section className="mt-6">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <span>📸</span> Zdjęcia z wydarzeń
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square bg-stone-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Favorite cuisines */}
        {profile.favoriteCategories.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <span>❤️</span> Ulubione kategorie
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm"
                  >
                    {category === "supper-club" && "🍽️ Supper Club"}
                    {category === "warsztaty" && "👨‍🍳 Warsztaty"}
                    {category === "degustacje" && "🍷 Degustacje"}
                    {category === "popup" && "🎪 Pop-up"}
                    {category === "active-food" && "🏃 Active + Food"}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
