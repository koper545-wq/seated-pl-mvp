import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Zgoszenia
        </h1>
        <p className="text-stone-500 mt-1">
          System zarzadzania zgoszeniami
        </p>
      </div>

      <Card className="p-12 text-center">
        <CardContent>
          <span className="text-6xl mb-4 block">🏗️</span>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            W budowie
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            System zarzadzania zgoszeniami jest w trakcie przygotowania.
            Ta funkcja pojawi sie w kolejnej wersji platformy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
