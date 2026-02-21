"use client";

import { useState } from "react";
import { faqItems, FAQItem } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Calendar, ChefHat, CreditCard } from "lucide-react";

const categories: { value: FAQItem["category"]; label: string; icon: React.ElementType }[] = [
  { value: "general", label: "Ogólne", icon: HelpCircle },
  { value: "booking", label: "Rezerwacje", icon: Calendar },
  { value: "hosts", label: "Dla hostów", icon: ChefHat },
  { value: "payments", label: "Płatności", icon: CreditCard },
];

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<FAQItem["category"]>("general");

  const filteredItems = faqItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-16 bg-muted/30" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Często zadawane pytania
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Masz pytania? Znajdziesz tutaj odpowiedzi na najczęściej zadawane pytania o Seated
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as FAQItem["category"])}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="gap-1.5 text-xs sm:text-sm"
                >
                  <category.icon className="h-4 w-4 hidden sm:block" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value}>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems
                    .filter((item) => item.category === category.value)
                    .map((item, index) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-left hover:no-underline hover:text-amber-600">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-muted-foreground text-sm">
              Nie znalazłeś odpowiedzi na swoje pytanie?{" "}
              <a
                href="mailto:kontakt@seated.pl"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Napisz do nas
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
