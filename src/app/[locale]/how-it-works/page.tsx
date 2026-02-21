import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import {
  Search,
  CalendarCheck,
  Utensils,
  Star,
  Users,
  ChefHat,
  MapPin,
  Heart,
  Shield,
  Clock,
  LucideIcon,
} from "lucide-react";

interface Step {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: Search,
    titleKey: "step1",
    descKey: "step1",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: CalendarCheck,
    titleKey: "step2",
    descKey: "step2",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: MapPin,
    titleKey: "step3",
    descKey: "step3",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Utensils,
    titleKey: "step4",
    descKey: "step4",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Star,
    titleKey: "step5",
    descKey: "step5",
    color: "bg-pink-100 text-pink-600",
  },
];

interface Feature {
  icon: LucideIcon;
  key: string;
}

const features: Feature[] = [
  { icon: Shield, key: "securePayments" },
  { icon: Users, key: "verifiedHosts" },
  { icon: Clock, key: "flexibleCancellation" },
  { icon: Heart, key: "foodieCommunity" },
];

const eventTypeKeys = [
  { key: "supperClub", emoji: "🍽️", slug: "supper-club" },
  { key: "chefsTable", emoji: "👑", slug: "chefs-table" },
  { key: "workshops", emoji: "👨‍🍳", slug: "warsztaty" },
  { key: "tastings", emoji: "🍷", slug: "degustacje" },
  { key: "popup", emoji: "🎪", slug: "popup" },
  { key: "activeFood", emoji: "🏃", slug: "active-food" },
  { key: "farmExperience", emoji: "🌾", slug: "farm" },
];

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorksPage");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-stone-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                {t("hero.cta")}
              </Button>
            </Link>
            <Link href="/become-host">
              <Button size="lg" variant="outline">
                {t("hero.ctaSecondary")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-4">
            {t("steps.title")}
          </h2>
          <p className="text-stone-600 text-center mb-12 max-w-2xl mx-auto">
            {t("steps.subtitle")}
          </p>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.titleKey}
                className={`flex flex-col md:flex-row items-center gap-6 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center`}
                  >
                    <step.icon className="w-10 h-10" />
                  </div>
                </div>
                <Card className="flex-1 w-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      {t(`steps.${step.titleKey}.title`)}
                    </h3>
                    <p className="text-stone-600">
                      {t(`steps.${step.descKey}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-4">
            {t("eventTypes.title")}
          </h2>
          <p className="text-stone-600 text-center mb-12 max-w-2xl mx-auto">
            {t("eventTypes.subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTypeKeys.map((type) => (
              <Link key={type.key} href={`/events?type=${type.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <span className="text-5xl mb-4 block">{type.emoji}</span>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                      {t(`eventTypes.${type.key}.title`)}
                    </h3>
                    <p className="text-stone-600 text-sm">
                      {t(`eventTypes.${type.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-4">
            {t("features.title")}
          </h2>
          <p className="text-stone-600 text-center mb-12 max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.key}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Hosts Section */}
      <section className="py-16 md:py-24 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold mb-4">{t("forHosts.title")}</h2>
          <p className="text-stone-300 mb-8 max-w-2xl mx-auto">
            {t("forHosts.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/become-host">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-stone-900"
              >
                {t("forHosts.cta")}
              </Button>
            </Link>
            <Link href="/faq/hosts">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-stone-900"
              >
                {t("forHosts.ctaSecondary")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-stone-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-stone-600 mb-8">{t("cta.subtitle")}</p>
          <Link href="/register">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
