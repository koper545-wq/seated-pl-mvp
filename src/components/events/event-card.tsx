import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

export interface EventCardProps {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  price: number;
  spotsLeft: number;
  imageGradient?: string;
  imageUrl?: string;
  hostName?: string;
  hostAvatar?: string;
}

export function EventCard({
  id,
  title,
  type,
  date,
  location,
  price,
  spotsLeft,
  imageGradient = "from-amber-200 to-orange-300",
  imageUrl,
}: EventCardProps) {
  const isSoldOut = spotsLeft === 0;

  return (
    <Link href={`/events/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`h-48 bg-gradient-to-br ${imageGradient} group-hover:scale-105 transition-transform duration-300`}
            />
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Wyprzedane
              </Badge>
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm"
          >
            {type}
          </Badge>
        </div>
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {title}
          </h3>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="font-semibold text-lg">{price} PLN</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{isSoldOut ? "Brak miejsc" : `${spotsLeft} miejsc`}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
