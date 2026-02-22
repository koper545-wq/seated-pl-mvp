import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Percent, Info, Wrench } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Ustawienia platformy
        </h1>
        <p className="text-stone-500 mt-1">
          Konfiguracja platformy Seated
        </p>
      </div>

      {/* Current Commission Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-amber-600" />
            Prowizja platformy
          </CardTitle>
          <CardDescription>
            Aktualna konfiguracja prowizji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
                Stawka prowizji
              </p>
              <p className="text-3xl font-bold text-amber-700">15%</p>
              <p className="text-sm text-amber-600 mt-1">
                od wartosci kazdej rezerwacji
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                Typ prowizji
              </p>
              <p className="text-xl font-bold text-stone-900">Procentowa</p>
              <p className="text-sm text-stone-500 mt-1">
                naliczana automatycznie
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-700 font-medium">
                Prowizja jest konfigurowana w kodzie
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Zmiana stawki prowizji wymaga aktualizacji w pliku <code className="bg-blue-100 px-1 rounded">src/lib/constants.ts</code>.
                Panel konfiguracji z poziomu UI zostanie dodany w kolejnej wersji.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-stone-600" />
            Planowane funkcje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Edycja prowizji z poziomu panelu" },
              { label: "Indywidualne stawki dla hostow" },
              { label: "System voucherow i kodow rabatowych" },
              { label: "System odznak i gamifikacji" },
              { label: "Zarzadzanie zgoszeniami (reports)" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-sm text-stone-700">{feature.label}</span>
                <span className="ml-auto text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  Planowane
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
