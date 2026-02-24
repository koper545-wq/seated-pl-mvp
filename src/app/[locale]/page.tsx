import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/events";
import { FAQSection } from "@/components/faq-section";
import { PartnersMarquee } from "@/components/partners-marquee";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { EventStatus } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  ChefHat,
  Wine,
  Utensils,
  GraduationCap,
  Bike,
  TreePine,
  Star,
  Shield,
  CreditCard,
  Crown,
  LucideIcon,
} from "lucide-react";

interface Category {
  nameKey: string;
  descKey: string;
  slug: string;
  icon: LucideIcon;
  color: string;
}

const categories: Category[] = [
  {
    nameKey: "supperClub",
    descKey: "supperClubDesc",
    slug: "supper-club",
    icon: Utensils,
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
  {
    nameKey: "chefsTable",
    descKey: "chefsTableDesc",
    slug: "chefs-table",
    icon: Crown,
    color: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  },
  {
    nameKey: "popup",
    descKey: "popupDesc",
    slug: "popup",
    icon: ChefHat,
    color: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  },
  {
    nameKey: "workshops",
    descKey: "workshopsDesc",
    slug: "warsztaty",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    nameKey: "tastings",
    descKey: "tastingsDesc",
    slug: "degustacje",
    icon: Wine,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  {
    nameKey: "activeFood",
    descKey: "activeFoodDesc",
    slug: "active-food",
    icon: Bike,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  {
    nameKey: "farmExperience",
    descKey: "farmExperienceDesc",
    slug: "farm",
    icon: TreePine,
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
];

// Gradient palette for events without images
const EVENT_GRADIENTS = [
  "from-amber-200 to-orange-300",
  "from-rose-200 to-pink-300",
  "from-purple-200 to-violet-300",
  "from-orange-200 to-red-300",
  "from-green-200 to-teal-300",
  "from-yellow-200 to-amber-300",
  "from-blue-200 to-indigo-300",
  "from-emerald-200 to-cyan-300",
];

// Event type display labels
const EVENT_TYPE_LABELS: Record<string, string> = {
  SUPPER_CLUB: "Supper Club",
  CHEFS_TABLE: "Chef's Table",
  POPUP: "Pop-up",
  WORKSHOP: "Warsztaty",
  TASTING: "Degustacje",
  FOOD_TOUR: "Food Tour",
  ACTIVE_FOOD: "Active + Food",
  FARM_EXPERIENCE: "Farm Experience",
  OTHER: "Inne",
};

const benefitIcons = [Star, Shield, CreditCard];
const benefitKeys = ["verified", "secure", "transparent"] as const;

async function getFeaturedEvents() {
  try {
    const events = await db.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
      take: 6,
    });

    return events.map((event, index) => ({
      id: event.id,
      title: event.title,
      type: EVENT_TYPE_LABELS[event.eventType] || event.eventType,
      date: format(new Date(event.date), "EEE, d MMM · HH:mm", { locale: pl }),
      location: event.locationPublic || "Wrocław",
      price: event.price / 100, // grosze → PLN
      spotsLeft: event.spotsLeft,
      imageGradient: EVENT_GRADIENTS[index % EVENT_GRADIENTS.length],
      imageUrl: event.images?.[0] || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch featured events:", error);
    return [];
  }
}

export default async function Home() {
  const t = await getTranslations("home");
  const featuredEvents = await getFeaturedEvents();

  const testimonials = [
    {
      name: t("testimonials.items.0.name"),
      text: t("testimonials.items.0.text"),
      event: t("testimonials.items.0.event"),
      rating: 5,
    },
    {
      name: t("testimonials.items.1.name"),
      text: t("testimonials.items.1.text"),
      event: t("testimonials.items.1.event"),
      rating: 5,
    },
    {
      name: t("testimonials.items.2.name"),
      text: t("testimonials.items.2.text"),
      event: t("testimonials.items.2.event"),
      rating: 5,
    },
  ];

  const steps = [
    {
      step: "1",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      step: "2",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      step: "3",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-amber-50 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              {t("hero.title")}{" "}
              <span className="text-amber-600">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-base h-12 px-8"
                asChild
              >
                <Link href="/events">{t("hero.cta")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 px-8"
                asChild
              >
                <Link href="/register?type=host">{t("hero.ctaSecondary")}</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {t("hero.stats", { count: "500" })}
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("categories.title")}
          </h2>
          <p className="text-muted-foreground">{t("categories.subtitle")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/events?type=${category.slug}`}>
              <Card
                className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-amber-200`}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div
                    className={`p-3 rounded-full ${category.color} mb-3 transition-colors`}
                  >
                    <category.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">
                    {t(`categories.${category.nameKey}`)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 hidden md:block">
                    {t(`categories.${category.descKey}`)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("featured.title")}
              </h2>
              <p className="text-muted-foreground mt-1">
                {t("featured.subtitle")}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/events">{t("featured.viewAll")}</Link>
            </Button>
          </div>
          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("featured.noEvents")}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("featured.noEventsDescription")}
                </p>
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/register?type=host">{t("hero.ctaSecondary")}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("benefits.title")}
          </h2>
          <p className="text-muted-foreground">{t("benefits.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {benefitKeys.map((key, index) => {
            const Icon = benefitIcons[index];
            return (
              <div key={key} className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t(`benefits.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(`benefits.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("howItWorks.title")}
            </h2>
            <p className="text-muted-foreground">{t("howItWorks.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-[2px] bg-amber-200" />
                )}
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 relative z-10">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("testimonials.title")}
          </h2>
          <p className="text-muted-foreground">{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 text-sm italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{testimonial.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {testimonial.event}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 bg-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-lg">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-base h-12 px-8"
              asChild
            >
              <Link href="/register?type=host">{t("cta.button")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-12 px-8 bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/how-it-works">{t("cta.learnMore")}</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-amber-200">
            {t("cta.stats", { count: "50" })}
          </p>
        </div>
      </section>

      {/* Partners / Trusted By */}
      <PartnersMarquee title={t("partners.title")} />
    </div>
  );
}
