import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems, getFAQByCategory } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, HelpCircle, Calendar, ChefHat, CreditCard } from "lucide-react";
import { LucideIcon } from "lucide-react";

type CategoryId = "general" | "booking" | "hosts" | "payments";

interface Category {
  id: CategoryId;
  icon: LucideIcon;
}

const categoryData: Category[] = [
  { id: "general", icon: HelpCircle },
  { id: "booking", icon: Calendar },
  { id: "hosts", icon: ChefHat },
  { id: "payments", icon: CreditCard },
];

export default async function FAQPage() {
  const t = await getTranslations("faqPage");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-50 to-stone-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToHome")}
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-stone-600">
            {t("subtitle")}{" "}
            <a
              href="mailto:kontakt@seated.pl"
              className="text-amber-600 hover:underline"
            >
              {t("contactLink")}
            </a>
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categoryData.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                    <category.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-stone-900">
                    {t(`categories.${category.id}.label`)}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {t(`categories.${category.id}.description`)}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {categoryData.map((category) => {
          const items = getFAQByCategory(category.id);
          return (
            <section key={category.id} id={category.id} className="mb-12 scroll-mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {t(`categories.${category.id}.label`)}
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="bg-white rounded-lg border px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium text-stone-900">
                        {item.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-stone-600 pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          );
        })}

        {/* Contact CTA */}
        <Card className="bg-stone-900 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {t("contact.title")}
            </h3>
            <p className="text-stone-300 mb-6 max-w-md mx-auto">
              {t("contact.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:kontakt@seated.pl">
                <Button className="bg-amber-500 hover:bg-amber-600 text-stone-900">
                  {t("contact.writeToUs")}
                </Button>
              </a>
              <Link href="/how-it-works">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-stone-900"
                >
                  {t("contact.howItWorks")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
