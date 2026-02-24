import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  Calendar,
  Star,
  Shield,
  Mail,
  AlertTriangle,
  FileText,
  HelpCircle,
  Server,
} from "lucide-react";

export default function LegalBriefPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć na stronę główną
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-2">
            <Shield className="w-4 h-4" />
            Dokument wewnętrzny — nie podlinkowany w nawigacji
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            Brief dla prawnika
          </h1>
          <p className="text-stone-600">
            Opis platformy Seated.pl, modelu biznesowego, ról uczestników i
            obszarów wymagających uregulowania prawnego.
          </p>
          <p className="text-stone-500 text-sm mt-2">
            Ostatnia aktualizacja: 22 lutego 2026
          </p>
        </div>

        <div className="prose prose-stone max-w-none">
          {/* Spis treści */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 mb-10">
            <h2 className="text-lg font-bold text-stone-900 mb-4 mt-0">
              Spis treści
            </h2>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
              {[
                { n: "1", label: "Czym jest Seated.pl?", href: "#czym-jest" },
                {
                  n: "2",
                  label: "Role użytkowników",
                  href: "#role-uzytkownikow",
                },
                { n: "3", label: "Typy wydarzeń", href: "#typy-wydarzen" },
                { n: "4", label: "Model biznesowy", href: "#model-biznesowy" },
                {
                  n: "5",
                  label: "Proces rezerwacji",
                  href: "#proces-rezerwacji",
                },
                { n: "6", label: "System recenzji", href: "#recenzje" },
                { n: "7", label: "Dane osobowe i GDPR", href: "#gdpr" },
                {
                  n: "8",
                  label: "Istniejąca dokumentacja",
                  href: "#dokumentacja",
                },
                {
                  n: "9",
                  label: "Komunikacja emailowa",
                  href: "#komunikacja",
                },
                {
                  n: "10",
                  label: "Problemy prawne do rozwiązania",
                  href: "#problemy-prawne",
                },
                {
                  n: "11",
                  label: "Dokumenty do przygotowania",
                  href: "#dokumenty",
                },
                {
                  n: "12",
                  label: "Pytania do prawnika",
                  href: "#pytania",
                },
                { n: "13", label: "Stack technologiczny", href: "#stack" },
              ].map((item) => (
                <a
                  key={item.n}
                  href={item.href}
                  className="text-stone-600 hover:text-amber-600 no-underline py-1 flex items-center gap-2"
                >
                  <span className="text-amber-600 font-mono text-xs w-5">
                    {item.n}.
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* 1. Czym jest Seated.pl? */}
          <section className="mb-10" id="czym-jest">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                1. Czym jest Seated.pl?
              </h2>
            </div>
            <p className="text-stone-600 mb-4">
              Seated.pl to{" "}
              <strong>dwustronna platforma marketplace</strong> łącząca:
            </p>
            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-4">
              <li>
                <strong>Hostów</strong> (organizatorów wydarzeń kulinarnych)
              </li>
              <li>
                <strong>Gości</strong> (uczestników wydarzeń)
              </li>
            </ul>
            <p className="text-stone-600 mb-4">
              Platforma umożliwia organizację i rezerwację{" "}
              <strong>prywatnych wydarzeń kulinarnych</strong> — kolacji w
              prywatnych domach (supper clubs), warsztatów gotowania, degustacji
              win, pop-upów gastronomicznych, doświadczeń farmowych itp.
            </p>
            <div className="bg-stone-100 rounded-lg p-4 text-sm text-stone-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <strong>Operator:</strong> Seated Sp. z o.o., Wrocław (w trakcie zakładania)
                </div>
                <div>
                  <strong>Rynek docelowy:</strong> Wrocław → cała Polska
                </div>
                <div>
                  <strong>Język platformy:</strong> polski
                </div>
                <div>
                  <strong>URL:</strong> seated.pl
                </div>
              </div>
            </div>
          </section>

          {/* 2. Role użytkowników */}
          <section className="mb-10" id="role-uzytkownikow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                2. Role użytkowników
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              2.1 Gość (Guest)
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1 mb-6">
              <li>Osoba fizyczna, min. 18 lat</li>
              <li>Przegląda wydarzenia, rezerwuje miejsca, płaci online</li>
              <li>Po wydarzeniu wystawia recenzję hostowi</li>
              <li>Może anulować rezerwację (zasady w sekcji 5)</li>
            </ul>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              2.2 Host (organizator)
            </h3>
            <p className="text-stone-600 mb-3">Dwa podtypy:</p>
            <ul className="list-disc pl-6 text-stone-600 space-y-1 mb-4">
              <li>
                <strong>Host indywidualny</strong> — osoba prywatna organizująca
                wydarzenia we własnym domu/lokalu
              </li>
              <li>
                <strong>Host restauracyjny</strong> — restauracja/firma
                gastronomiczna organizująca specjalne wydarzenia
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2">
                Proces weryfikacji hosta
              </h4>
              <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
                <li>
                  Wypełnia formularz zgłoszeniowy (dane osobowe/firmowe, adres,
                  doświadczenie, specjalizacje, zdjęcia)
                </li>
                <li>Platforma weryfikuje zgłoszenie w ciągu 48h</li>
                <li>Rozmowa weryfikacyjna</li>
                <li>
                  Zatwierdzenie przez admina → host może tworzyć wydarzenia
                </li>
              </ol>
            </div>

            <details className="mb-6">
              <summary className="text-stone-700 font-medium cursor-pointer hover:text-amber-600">
                Dane zbierane od hosta (rozwiń)
              </summary>
              <ul className="list-disc pl-6 text-stone-600 space-y-1 mt-2 text-sm">
                <li>Imię, nazwisko (lub nazwa firmy), email, telefon</li>
                <li>Adres (ulica, miasto, kod pocztowy, dzielnica)</li>
                <li>NIP (opcjonalnie)</li>
                <li>Specjalizacje kuchni, typy wydarzeń, opis/bio</li>
                <li>Zdjęcia profilowe i kulinarne</li>
                <li>Dane bankowe do wypłat (numer konta)</li>
                <li>Dostępność terminowa</li>
              </ul>
            </details>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              2.3 Administrator
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1">
              <li>
                Zarządza platformą, weryfikuje hostów, moderuje treści
              </li>
              <li>Zatwierdza/odrzuca aplikacje hostów i nowe wydarzenia</li>
              <li>Zarządza użytkownikami (zawieszenie, ban)</li>
            </ul>
          </section>

          {/* 3. Typy wydarzeń */}
          <section className="mb-10" id="typy-wydarzen">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                3. Typy wydarzeń
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  name: "Supper Club",
                  desc: "Prywatne kolacje/obiady",
                },
                {
                  name: "Chef's Table",
                  desc: "Ekskluzywne doświadczenia kulinarne",
                },
                {
                  name: "Pop-up",
                  desc: "Tymczasowe wydarzenia gastronomiczne",
                },
                {
                  name: "Warsztaty gotowania",
                  desc: "Edukacyjne warsztaty kulinarne",
                },
                {
                  name: "Degustacje",
                  desc: "Degustacje win, piwa, whisky itp.",
                },
                {
                  name: "Active Food",
                  desc: "Jedzenie + aktywność (np. gotowanie + joga)",
                },
                {
                  name: "Farm Experience",
                  desc: "Doświadczenia farm-to-table",
                },
                {
                  name: "Kolaboracja z restauracją",
                  desc: "Współpraca z restauracjami",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-white border border-stone-200 rounded-lg p-3"
                >
                  <div className="font-medium text-stone-900 text-sm">
                    {item.name}
                  </div>
                  <div className="text-stone-500 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Model biznesowy */}
          <section className="mb-10" id="model-biznesowy">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                4. Model biznesowy i przepływ finansowy
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              4.1 Prowizja platformy
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-green-700">15%</span>
                <p className="text-green-600 text-sm mt-1">
                  Stała prowizja od każdej transakcji
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold text-stone-900">200 PLN</div>
                  <div className="text-stone-500">Gość płaci</div>
                </div>
                <div>
                  <div className="font-bold text-green-700">30 PLN</div>
                  <div className="text-stone-500">Seated (15%)</div>
                </div>
                <div>
                  <div className="font-bold text-stone-900">170 PLN</div>
                  <div className="text-stone-500">Host (85%)</div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              4.2 Przepływ płatności
            </h3>
            <ol className="list-decimal pl-6 text-stone-600 space-y-2 mb-6">
              <li>Gość rezerwuje wydarzenie</li>
              <li>
                Host zatwierdza rezerwację (tryb manualny) lub automatyczne
                zatwierdzenie (tryb instant)
              </li>
              <li>
                Po zatwierdzeniu gość otrzymuje email z{" "}
                <strong>linkiem do płatności</strong> (deadline: 24h)
              </li>
              <li>
                Gość płaci kartą przez <strong>Stripe</strong> (zewnętrzny
                procesor płatności)
              </li>
              <li>Płatność potwierdzona → rezerwacja aktywna</li>
              <li>
                Po zakończeniu wydarzenia → wypłata na konto hosta w ciągu{" "}
                <strong>3 dni roboczych</strong>
              </li>
            </ol>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              4.3 Typy transakcji
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1">
              <li>
                <strong>CHARGE</strong> — pobranie płatności od gościa
              </li>
              <li>
                <strong>REFUND</strong> — zwrot pieniędzy
              </li>
              <li>
                <strong>PAYOUT</strong> — wypłata dla hosta
              </li>
            </ul>
          </section>

          {/* 5. Proces rezerwacji */}
          <section className="mb-10" id="proces-rezerwacji">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                5. Proces rezerwacji
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              5.1 Dwa tryby rezerwacji
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-white border border-stone-200 rounded-lg p-4">
                <div className="font-bold text-stone-900 mb-1">Instant</div>
                <p className="text-stone-500 text-sm m-0">
                  Automatyczne zatwierdzenie, natychmiastowa rezerwacja
                </p>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-4">
                <div className="font-bold text-stone-900 mb-1">Manual</div>
                <p className="text-stone-500 text-sm m-0">
                  Host ma 48h na zatwierdzenie/odrzucenie rezerwacji
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              5.2 Statusy rezerwacji
            </h3>
            <div className="bg-stone-100 rounded-lg p-4 mb-6 font-mono text-sm text-stone-700">
              PENDING → APPROVED → COMPLETED
              <br />
              {"          "}↘ CANCELLED
              <br />
              {"       "}→ DECLINED
              <br />
              {"       "}→ NO_SHOW (gość nie przyszedł)
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              5.3 Polityka anulowania
            </h3>
            <div className="space-y-2 mb-6">
              {[
                {
                  label: "Gość anuluje 48h+ przed wydarzeniem",
                  result: "Pełny zwrot",
                  color: "green",
                },
                {
                  label: "Gość anuluje poniżej 48h",
                  result: "Brak zwrotu",
                  color: "red",
                },
                {
                  label: "Host anuluje wydarzenie",
                  result: "Automatyczny pełny zwrot dla gościa",
                  color: "green",
                },
                {
                  label: "No-show gościa",
                  result: "Brak zwrotu (host zachowuje płatność)",
                  color: "red",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-3"
                >
                  <span className="text-stone-700 text-sm">{item.label}</span>
                  <span
                    className={`text-sm font-medium ${item.color === "green" ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.result}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              5.4 Lista oczekujących (Waitlist)
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1">
              <li>
                Gdy wszystkie miejsca zajęte, gość może dołączyć do listy
                oczekujących
              </li>
              <li>
                Gdy miejsce się zwolni → powiadomienie email z{" "}
                <strong>12h oknem na rezerwację</strong>
              </li>
              <li>Po upływie 12h → miejsce przechodzi do kolejnej osoby</li>
            </ul>
          </section>

          {/* 6. System recenzji */}
          <section className="mb-10" id="recenzje">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                6. System recenzji
              </h2>
            </div>
            <ul className="list-disc pl-6 text-stone-600 space-y-2">
              <li>
                Gość może wystawić recenzję hostowi po zakończeniu wydarzenia
              </li>
              <li>Host może wystawić recenzję gościowi</li>
              <li>
                Ocena: <strong>1–5 gwiazdek</strong> + kategorie (jedzenie,
                komunikacja, wartość, atmosfera)
              </li>
              <li>Host może odpowiedzieć na recenzję</li>
              <li>
                Możliwość zgłoszenia nieprawidłowej recenzji do moderacji
              </li>
            </ul>
          </section>

          {/* 7. Dane osobowe */}
          <section className="mb-10" id="gdpr">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                7. Dane osobowe i GDPR
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              7.1 Dane zbierane
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1 mb-6">
              <li>
                <strong>Dane konta:</strong> imię, nazwisko, email, telefon,
                data urodzenia
              </li>
              <li>
                <strong>Dane hosta:</strong> + adres, NIP, dane bankowe, zdjęcia
              </li>
              <li>
                <strong>Dane rezerwacji:</strong> historia rezerwacji,
                preferencje dietetyczne, alergie
              </li>
              <li>
                <strong>Dane techniczne:</strong> IP, cookies, dane urządzenia
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              7.2 Udostępnianie danych
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1 mb-6">
              <li>
                <strong>Gość → Host:</strong> imię, telefon, alergie/diety
                (niezbędne do realizacji wydarzenia)
              </li>
              <li>
                <strong>Host → Gość:</strong> nazwa firmy, opis, lokalizacja
                publiczna (dzielnica)
              </li>
              <li>
                <strong>Pełny adres wydarzenia</strong> → ujawniany gościowi
                dopiero po zatwierdzeniu rezerwacji
              </li>
              <li>
                <strong>Procesor płatności (Stripe):</strong> dane transakcyjne
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-stone-800 mb-3">
              7.3 Istniejąca dokumentacja GDPR
            </h3>
            <ul className="list-disc pl-6 text-stone-600 space-y-1">
              <li>Polityka prywatności (po polsku, na stronie)</li>
              <li>
                Administrator danych: Seated Sp. z o.o.
              </li>
              <li>
                Kategorie danych, cele przetwarzania, okresy retencji
              </li>
              <li>
                Prawa użytkowników (dostęp, sprostowanie, usunięcie,
                przenoszenie)
              </li>
              <li>UODO jako organ nadzorczy</li>
            </ul>
          </section>

          {/* 8. Istniejąca dokumentacja */}
          <section className="mb-10" id="dokumentacja">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                8. Istniejąca dokumentacja prawna
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-stone-900 mt-0 mb-2">
                  Regulamin
                </h3>
                <p className="text-stone-500 text-xs mb-3">
                  Ostatnia aktualizacja: 1 lutego 2025
                </p>
                <ul className="text-stone-600 text-sm space-y-1 list-disc pl-4">
                  <li>Definicje, zasady rezerwacji, płatności</li>
                  <li>
                    Platforma = <strong>pośrednik/marketplace</strong>
                  </li>
                  <li>Wymóg 18+ lat</li>
                  <li>Obowiązki hostów i gości</li>
                  <li>BHP/HACCP, ujawnianie alergenów</li>
                  <li>14 dni na zmiany regulaminu</li>
                </ul>
                <Link href="/terms">
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Zobacz regulamin →
                  </Button>
                </Link>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-stone-900 mt-0 mb-2">
                  Polityka prywatności
                </h3>
                <p className="text-stone-500 text-xs mb-3">
                  Ostatnia aktualizacja: 1 lutego 2025
                </p>
                <ul className="text-stone-600 text-sm space-y-1 list-disc pl-4">
                  <li>Zgodna z RODO</li>
                  <li>Dane konta: 30 dni po usunięciu</li>
                  <li>Rezerwacje: 5 lat podatkowych</li>
                  <li>Prawa użytkowników</li>
                  <li>
                    Kontakt: privacy@seated.pl
                  </li>
                </ul>
                <Link href="/privacy">
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Zobacz politykę →
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* 9. Komunikacja emailowa */}
          <section className="mb-10" id="komunikacja">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                9. Komunikacja emailowa
              </h2>
            </div>
            <p className="text-stone-600 mb-4">
              Platforma wysyła <strong>15 typów emaili transakcyjnych</strong>,
              w tym:
            </p>
            <ul className="list-disc pl-6 text-stone-600 space-y-1 mb-6">
              <li>
                Potwierdzenie rezerwacji, zatwierdzenie/odrzucenie, przypomnienia
              </li>
              <li>
                Potwierdzenie płatności z rozbiciem na prowizję (15%) i zarobek
                hosta (85%)
              </li>
              <li>Powiadomienia o liście oczekujących (12h okno)</li>
              <li>Status aplikacji hosta (otrzymanie, zatwierdzenie)</li>
              <li>System zgłoszeń i moderacji</li>
            </ul>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-cyan-800 mb-2 mt-0">
                Kluczowe terminy w emailach
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-cyan-700">
                  <strong>48h</strong> — decyzja hosta (zatwierdzenie rezerwacji)
                </div>
                <div className="text-cyan-700">
                  <strong>24h</strong> — deadline na płatność gościa
                </div>
                <div className="text-cyan-700">
                  <strong>12h</strong> — okno z listy oczekujących
                </div>
                <div className="text-cyan-700">
                  <strong>3 dni rob.</strong> — wypłata dla hosta
                </div>
              </div>
            </div>
          </section>

          {/* 10. Problemy prawne */}
          <section className="mb-10" id="problemy-prawne">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                10. Problemy prawne do rozwiązania
              </h2>
            </div>

            {/* PILNE */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
              <h3 className="text-lg font-bold text-red-800 mt-0 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                PILNE — przed startem
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-red-900 mt-0 mb-2 text-sm">
                    10.1 Umowa z hostem (Host Agreement)
                  </h4>
                  <p className="text-red-800 text-sm mb-2">
                    Brak formalnej umowy regulującej relację platforma–host.
                    Potrzebna umowa obejmująca:
                  </p>
                  <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
                    <li>Warunki współpracy i prowizję (15%)</li>
                    <li>
                      Obowiązki hosta (bezpieczeństwo żywności, ubezpieczenie,
                      licencje)
                    </li>
                    <li>Zasady wypłat (3 dni robocze, dane bankowe)</li>
                    <li>Zasady zawieszenia/usunięcia konta hosta</li>
                    <li>
                      Odpowiedzialność za szkody (kto odpowiada za zatrucia
                      pokarmowe?)
                    </li>
                    <li>Klauzula poufności danych gości</li>
                    <li>
                      Zobowiązanie hosta do przestrzegania prawa (działalność
                      nierejestrowana vs firma vs restauracja)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-red-900 mt-0 mb-2 text-sm">
                    10.2 Status prawny hosta
                  </h4>
                  <p className="text-red-800 text-sm mb-2">
                    Kluczowe pytanie:{" "}
                    <strong>
                      Czy host indywidualny prowadzi działalność gospodarczą?
                    </strong>
                  </p>
                  <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
                    <li>
                      Próg działalności nierejestrowanej: do 75% min.
                      wynagrodzenia/mies. (~3226 PLN w 2025)
                    </li>
                    <li>
                      Czy platforma musi weryfikować przekroczenie tego progu?
                    </li>
                    <li>Jakie obowiązki podatkowe ma host? (PIT? VAT?)</li>
                    <li>
                      Czy platforma jest zobowiązana do raportowania dochodów
                      hostów? (DAC7?)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-red-900 mt-0 mb-2 text-sm">
                    10.3 Bezpieczeństwo żywności (HACCP/Sanepid)
                  </h4>
                  <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
                    <li>
                      Prywatne osoby gotujące w domu — czy wymaga to zgłoszenia
                      do Sanepidu?
                    </li>
                    <li>
                      Czy platforma ponosi odpowiedzialność pośrednią za
                      bezpieczeństwo żywności?
                    </li>
                    <li>
                      Wymagania sanitarne dla różnych typów wydarzeń
                    </li>
                    <li>
                      Ubezpieczenie OC hosta — obowiązkowe czy zalecane?
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-red-900 mt-0 mb-2 text-sm">
                    10.4 Regulamin — uzupełnienia
                  </h4>
                  <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
                    <li>
                      Mechanizm rozstrzygania sporów (mediacja/arbitraż)
                    </li>
                    <li>
                      Limit odpowiedzialności platformy (kwota w PLN/EUR)
                    </li>
                    <li>Procedura reklamacyjna</li>
                    <li>
                      Prawo odstąpienia od umowy (ustawa o prawach konsumenta)
                    </li>
                    <li>Force majeure</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* WAŻNE */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <h3 className="text-lg font-bold text-amber-800 mt-0 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                WAŻNE — do dopracowania
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-amber-900 mt-0 mb-1">
                    10.5 Ochrona konsumenta
                  </h4>
                  <p className="text-amber-800">
                    Czy gość ma 14-dniowe prawo odstąpienia od umowy na
                    wydarzenie kulinarne? (wyjątek: art. 38 pkt 12 ustawy o
                    prawach konsumenta — usługi kulturalne/rozrywkowe z ustaloną
                    datą)
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 mt-0 mb-1">
                    10.6 KYC / AML
                  </h4>
                  <p className="text-amber-800">
                    Weryfikacja tożsamości hostów przed wypłatami.
                    Przeciwdziałanie praniu pieniędzy. Czy Stripe obsługuje KYC
                    za nas?
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 mt-0 mb-1">
                    10.7 DAC7 — obowiązek raportowania
                  </h4>
                  <p className="text-amber-800">
                    Od 2024 r. platformy cyfrowe muszą raportować dane
                    sprzedawców do urzędów skarbowych (NIP/PESEL, adresy,
                    przychody).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 mt-0 mb-1">
                    10.8 Ubezpieczenie platformy
                  </h4>
                  <p className="text-amber-800">
                    OC platformy jako pośrednika, ubezpieczenie cyber (wyciek
                    danych), ubezpieczenie od odpowiedzialności za produkt
                    (żywność).
                  </p>
                </div>
              </div>
            </div>

            {/* DO ROZWAŻENIA */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-green-800 mt-0 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                DO ROZWAŻENIA — przyszłość
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-bold text-green-900 mt-0 mb-1">
                    10.9 Umowy DPA (powierzenie przetwarzania danych)
                  </h4>
                  <p className="text-green-700">
                    Z procesorami: Stripe, Supabase, Vercel, Resend. Wymagane
                    przez RODO Art. 28.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 mt-0 mb-1">
                    10.10 Regulamin dla hostów restauracyjnych
                  </h4>
                  <p className="text-green-700">
                    Oddzielne warunki B2B vs B2C? Faktury VAT za prowizję.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 mt-0 mb-1">
                    10.11 System zgłoszeń / moderacji
                  </h4>
                  <p className="text-green-700">
                    Procedura obsługi skarg, polityka antydyskryminacyjna,
                    ochrona przed nękaniem.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 mt-0 mb-1">
                    10.12 Własność intelektualna
                  </h4>
                  <p className="text-green-700">
                    Licencja na treści hostów (zdjęcia, opisy), ochrona marki,
                    polityka Notice &amp; Takedown.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 11. Dokumenty do przygotowania */}
          <section className="mb-10" id="dokumenty">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                11. Dokumenty do przygotowania
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-300">
                    <th className="text-left py-2 pr-2 text-stone-500 font-medium w-8">
                      #
                    </th>
                    <th className="text-left py-2 pr-4 text-stone-500 font-medium">
                      Dokument
                    </th>
                    <th className="text-left py-2 pr-4 text-stone-500 font-medium w-24">
                      Priorytet
                    </th>
                    <th className="text-left py-2 text-stone-500 font-medium">
                      Opis
                    </th>
                  </tr>
                </thead>
                <tbody className="text-stone-700">
                  {[
                    {
                      n: 1,
                      doc: "Regulamin platformy (aktualizacja)",
                      priority: "PILNE",
                      pColor: "red",
                      desc: "Procedura reklamacji, spory, limit odpowiedzialności",
                    },
                    {
                      n: 2,
                      doc: "Umowa z hostem indywidualnym",
                      priority: "PILNE",
                      pColor: "red",
                      desc: "Prowizja, odpowiedzialność, bezpieczeństwo żywności",
                    },
                    {
                      n: 3,
                      doc: "Umowa z hostem restauracyjnym",
                      priority: "PILNE",
                      pColor: "red",
                      desc: "Warunki B2B, fakturowanie prowizji, VAT",
                    },
                    {
                      n: 4,
                      doc: "Polityka prywatności (aktualizacja)",
                      priority: "WAŻNE",
                      pColor: "amber",
                      desc: "Doprecyzować DPA, breach notification",
                    },
                    {
                      n: 5,
                      doc: "Formularz odstąpienia od umowy",
                      priority: "WAŻNE",
                      pColor: "amber",
                      desc: "Jeśli wymagany przez prawo konsumenckie",
                    },
                    {
                      n: 6,
                      doc: "Polityka bezpieczeństwa żywności",
                      priority: "WAŻNE",
                      pColor: "amber",
                      desc: "Wymogi dla hostów, disclaimer platformy",
                    },
                    {
                      n: 7,
                      doc: "Umowy DPA (powierzenie danych)",
                      priority: "WAŻNE",
                      pColor: "amber",
                      desc: "Ze Stripe, Supabase, Vercel, Resend",
                    },
                    {
                      n: 8,
                      doc: "Procedura KYC hostów",
                      priority: "WAŻNE",
                      pColor: "amber",
                      desc: "Weryfikacja tożsamości przed wypłatami",
                    },
                    {
                      n: 9,
                      doc: "Polityka DAC7",
                      priority: "WAŻNE",
                      pColor: "amber",
                      desc: "Raportowanie dochodów hostów do US",
                    },
                    {
                      n: 10,
                      doc: "Polityka moderacji treści",
                      priority: "PÓŹNIEJ",
                      pColor: "green",
                      desc: "Zasady recenzji, zgłoszeń, dyskryminacji",
                    },
                  ].map((row) => (
                    <tr key={row.n} className="border-b border-stone-100">
                      <td className="py-2 pr-2 text-stone-400">{row.n}</td>
                      <td className="py-2 pr-4 font-medium">{row.doc}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            row.pColor === "red"
                              ? "bg-red-100 text-red-700"
                              : row.pColor === "amber"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-2 text-stone-500">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 12. Pytania do prawnika */}
          <section className="mb-10" id="pytania">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                12. Pytania do prawnika
              </h2>
            </div>

            <div className="space-y-3">
              {[
                "Czy osoba prywatna gotująca w domu na supper clubie musi mieć pozwolenie Sanepidu? Jakie regulacje sanitarne dotyczą takich wydarzeń?",
                "Czy platforma ponosi odpowiedzialność za zatrucia pokarmowe u gości wydarzeń organizowanych przez hostów?",
                "Czy gość-konsument ma prawo do 14-dniowego odstąpienia od umowy na wydarzenie kulinarne? (wyjątek: usługi związane z wydarzeniami kulturalnymi/rozrywkowymi, art. 38 pkt 12)",
                "Jaki status prawny powinien mieć host indywidualny? Działalność nierejestrowana? Czy platforma musi weryfikować przekroczenie progu?",
                "Czy prowizja 15% wymaga wystawiania faktury przez platformę hostowi? Kwestie VAT.",
                "Czy podlegamy obowiązkowi DAC7? Jeśli tak — od jakiego momentu i jakie dane musimy zbierać?",
                "Czy potrzebujemy licencji KNF/KIP jako pośrednik w płatnościach? (Stripe jest procesorem, ale my pośredniczymy)",
                "Ubezpieczenie OC — czy platforma powinna wymagać od hostów posiadania polisy OC? Czy platforma sama potrzebuje takiej polisy?",
              ].map((q, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white border border-stone-200 rounded-lg p-4"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-stone-700 text-sm m-0">{q}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 13. Stack technologiczny */}
          <section className="mb-10" id="stack">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <Server className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 m-0">
                13. Stack technologiczny
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                {
                  label: "Aplikacja webowa",
                  value: "Next.js / React",
                },
                {
                  label: "Baza danych",
                  value: "PostgreSQL na Supabase (EU — Frankfurt)",
                },
                { label: "Płatności", value: "Stripe (planowane)" },
                {
                  label: "Hosting",
                  value: "Vercel (USA → planowo home.pl, Polska)",
                },
                { label: "Email", value: "Resend (transakcyjny)" },
                {
                  label: "Zdjęcia",
                  value: "Supabase Storage (EU)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-stone-200 rounded-lg p-3"
                >
                  <div className="text-stone-500 text-xs">{item.label}</div>
                  <div className="text-stone-900 font-medium text-sm">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Uwaga dot. GDPR:</strong> Vercel (hosting) ma serwery w
              USA — potencjalny problem z transferem danych. Planujemy migrację
              na serwery polskie (home.pl).
            </div>
          </section>

          {/* Kontakt */}
          <section className="border-t border-stone-200 pt-8">
            <div className="bg-stone-100 rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-stone-900 mt-0 mb-3">
                Kontakt
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-stone-600">
                <div>
                  <div className="font-medium text-stone-900">Platforma</div>
                  Seated.pl
                </div>
                <div>
                  <div className="font-medium text-stone-900">Email</div>
                  <a
                    href="mailto:kontakt@seated.pl"
                    className="text-amber-600 hover:underline"
                  >
                    kontakt@seated.pl
                  </a>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Prywatność</div>
                  <a
                    href="mailto:privacy@seated.pl"
                    className="text-amber-600 hover:underline"
                  >
                    privacy@seated.pl
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
