import {
  UtensilsCrossed,
  Wine,
  Croissant,
  Coffee,
  ChefHat,
  Cake,
  Leaf,
  Beer,
  Soup,
  Salad,
  type LucideIcon,
} from "lucide-react";

interface Partner {
  name: string;
  icon: LucideIcon;
}

const partners: Partner[] = [
  { name: "Bistro Nowa", icon: UtensilsCrossed },
  { name: "Winnica Dolnośląska", icon: Wine },
  { name: "Piekarnia Staromiejska", icon: Croissant },
  { name: "Ramen Wrocław", icon: Soup },
  { name: "Farma Oleśnicka", icon: Leaf },
  { name: "Kawa i Chleb", icon: Coffee },
  { name: "Pasta Fresca", icon: ChefHat },
  { name: "Słodka Chwila", icon: Cake },
  { name: "Ogród Smaków", icon: Salad },
  { name: "Piwoteka Craft", icon: Beer },
];

function PartnerCard({ partner }: { partner: Partner }) {
  const Icon = partner.icon;
  return (
    <div className="flex items-center gap-3 px-6 py-3 mx-3 rounded-lg border border-border/50 bg-muted/20 shrink-0 hover:bg-muted/40 transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground/60" />
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {partner.name}
      </span>
    </div>
  );
}

export function PartnersMarquee({ title }: { title: string }) {
  return (
    <section className="py-12 bg-background border-t">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Gradient masks for smooth fade-in/out at edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Marquee track: two identical copies for seamless loop */}
        <div className="flex animate-marquee" style={{ width: "fit-content" }}>
          <div className="flex">
            {partners.map((partner, i) => (
              <PartnerCard key={i} partner={partner} />
            ))}
          </div>
          <div className="flex" aria-hidden="true">
            {partners.map((partner, i) => (
              <PartnerCard key={`dup-${i}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
